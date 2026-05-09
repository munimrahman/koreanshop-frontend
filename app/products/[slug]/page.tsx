import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProduct, getProducts } from "@/lib/api/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductTabsWrapper } from "@/components/product/ProductTabsWrapper";
import { RelatedProducts } from "@/components/product/RelatedProduct";
import { ProductLoadingState } from "@/components/product/ProductLoadingState";
import { ProductErrorState } from "@/components/product/ProductErrorState";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import PageViewEvent from "@/components/PixelComponent/PageViewEvent";
import { generateEventId, BASE_URL } from "@/lib/utils";

// Pre-render all existing product pages at build time.
// New products added after build are rendered on first visit and then cached.
export const revalidate = 600;

const CUID_RE = /^c[a-z0-9]{24}$/;

export async function generateStaticParams() {
  try {
    const result = await getProducts({ limit: 200, page: 1 });
    return result.products.map((p: { id: string; slug?: string }) => ({
      slug: p.slug || p.id,
    }));
  } catch {
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.slug);

    const currentVariation = product.variations[0];
    const price = currentVariation.salePrice || currentVariation.price;
    const canonicalSlug = product.slug || product.id;

    return {
      title:
        product.metaTitle ||
        `${product.name} - ${product.brand?.name || "Korean Skincare"}`,
      description:
        product.metaDescription ||
        product.description ||
        `${product.name} by ${product.brand?.name}. High-quality Korean skincare product.`,
      keywords: [
        product.name,
        product.brand?.name,
        product.category?.name,
        "Korean skincare",
        "beauty products",
        ...(product.tags || []),
      ]
        .filter(Boolean)
        .join(", "),
      openGraph: {
        title:
          product.metaTitle ||
          `${product.name} - ${product.brand?.name || "Korean Skincare"}`,
        description:
          product.metaDescription ||
          product.description ||
          `${product.name} by ${product.brand?.name}`,
        images: [
          {
            url: product.baseImageUrl || "/placeholder.jpg",
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title:
          product.metaTitle ||
          `${product.name} - ${product.brand?.name || "Korean Skincare"}`,
        description:
          product.metaDescription ||
          product.description ||
          `${product.name} by ${product.brand?.name}`,
        images: [product.baseImageUrl || "/placeholder.jpg"],
      },
      alternates: {
        canonical: `/products/${canonicalSlug}`,
      },
      other: {
        "product:price:amount": price?.toString() || "0",
        "product:price:currency": "BDT",
        "product:availability":
          currentVariation.stockQuantity > 0 ? "in stock" : "out of stock",
        "product:condition": "new",
        "product:brand": product.brand?.name || "",
        "product:category": product.category?.name || "",
      },
    };
  } catch (error) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
}

async function ProductData({ slug }: { slug: string }) {
  try {
    // If the URL still uses the old CUID format, redirect to the slug URL
    if (CUID_RE.test(slug)) {
      const product = await getProduct(slug);
      if (product?.slug) {
        redirect(`/products/${product.slug}`);
      }
    }

    // Fetch product data server-side
    const product = await getProduct(slug);

    if (!product) {
      notFound();
    }

    // Calculate average rating server-side
    const averageRating =
      product.reviews && product.reviews.length > 0
        ? product.reviews.reduce(
            (sum: number, review: { rating: number }) => sum + review.rating,
            0
          ) / product.reviews.length
        : 0;

    // Fetch related products server-side using slugs when available
    const [relatedByCategory, relatedByBrand] = await Promise.all([
      getProducts({
        limit: 3,
        category: product.category?.slug || product.category?.id,
      }),
      getProducts({
        limit: 3,
        brand: product.brand?.slug || product.brand?.id,
      }),
    ]);

    const relatedProducts = [
      ...relatedByCategory.products,
      ...relatedByBrand.products,
    ]
      .filter(
        (product, index, self) =>
          self.findIndex((p) => p.id === product.id) === index
      )
      .filter((p) => p.id !== product.id);

    const galleryImages = [
      product.baseImageUrl,
      ...product.images.map((img) => img.imageUrl),
    ].filter((img): img is string => typeof img === "string");

    const currentVariation = product.variations[0];
    const isOnSale = !!(
      currentVariation.salePrice &&
      Number(currentVariation.salePrice) < Number(currentVariation.price)
    );
    const discountPercentage = isOnSale
      ? Math.round(
          (1 -
            Number(currentVariation.salePrice) /
              Number(currentVariation.price)) *
            100
        )
      : 0;

    const canonicalSlug = product.slug || product.id;
    const productUrl = `${BASE_URL}/products/${canonicalSlug}`;
    const price = Number(currentVariation.salePrice || currentVariation.price);
    const allImages = [
      product.baseImageUrl,
      ...product.images.map((img: { imageUrl: string }) => img.imageUrl),
    ].filter(Boolean);

    const productSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || product.metaDescription || undefined,
      image: allImages,
      sku: product.id,
      brand: product.brand?.name
        ? { "@type": "Brand", name: product.brand.name }
        : undefined,
      offers: {
        "@type": "Offer",
        price: price.toFixed(2),
        priceCurrency: "BDT",
        availability:
          currentVariation.stockQuantity > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        url: productUrl,
        seller: {
          "@type": "Organization",
          name: "Korean Skincare Shop BD",
        },
      },
    };

    if (product.reviews && product.reviews.length > 0) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: product.reviews.length,
        bestRating: 5,
        worstRating: 1,
      };
      productSchema.review = product.reviews
        .slice(0, 5)
        .map((r: { rating: number; customerName: string; comment?: string }) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
          },
          author: { "@type": "Person", name: r.customerName },
          ...(r.comment ? { reviewBody: r.comment } : {}),
        }));
    }

    const breadcrumbItems: Array<Record<string, unknown>> = [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${BASE_URL}/products`,
      },
    ];
    if (product.category?.name) {
      breadcrumbItems.push({
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `${BASE_URL}/products?category=${product.category.slug || product.category.id}`,
      });
    }
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: product.name,
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      <div className="bg-white dark:bg-gray-900 min-h-screen">
        <div className="mx-auto px-4 py-3 container">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-5 text-muted-foreground text-sm">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <Link
              href={`/products?category=${product.category?.slug || product.category?.id}`}
              className="hover:text-primary"
            >
              {product.category?.name
                ? product.category.name.length > 10
                  ? product.category.name.slice(0, 10) + "..."
                  : product.category.name
                : ""}
            </Link>
            <span>/</span>
            <span className="text-foreground">
              {product.name.length > 15
                ? product.name.slice(0, 15) + "..."
                : product.name}
            </span>
          </div>

          {/* Back Button */}
          <Button variant="ghost" className="mb-2" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Products
            </Link>
          </Button>

          {/* Product Main Content */}
          <div className="gap-12 grid grid-cols-1 lg:grid-cols-2 mb-16">
            <ProductGallery
              images={galleryImages}
              name={product.name}
              isOnSale={isOnSale}
              discountPercentage={discountPercentage}
              isNew={
                new Date(product.createdAt) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            />
            <ProductInfo
              product={product}
              name={product.name}
              description={product.description ?? ""}
              brandName={product.brand?.name ?? ""}
              brandLogo={product.brand?.logoUrl}
              averageRating={averageRating}
              reviewCount={product.reviews.length}
              tags={product.tags}
              variations={product.variations}
            />
          </div>

          {/* Product Tabs - This component handles client-side interactions */}
          <ProductTabsWrapper initialProduct={product} />

          {/* Related Products */}
          <RelatedProducts products={relatedProducts} />
        </div>
        {/* <PageViewEvent eventName="ViewContent" /> */}
      </div>
      </>
    );
  } catch (error) {
    return <ProductErrorState error="Failed to load product" />;
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<ProductLoadingState />}>
      <ProductData slug={resolvedParams.slug} />
    </Suspense>
  );
}
