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
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageViewEvent from "@/components/PixelComponent/PageViewEvent";
import { generateEventId } from "@/lib/utils";

// Pre-render all existing product pages at build time.
// New products added after build are rendered on first visit and then cached.
export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const result = await getProducts({ limit: 200, page: 1 });
    return result.products.map((p: { id: string }) => ({ id: p.id }));
  } catch {
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.id);

    const currentVariation = product.variations[0];
    const price = currentVariation.salePrice || currentVariation.price;

    return {
      title: `${product.name} - ${product.brand?.name || "Korean Skincare"}`,
      description:
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
        title: `${product.name} - ${product.brand?.name || "Korean Skincare"}`,
        description:
          product.description || `${product.name} by ${product.brand?.name}`,
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
        title: `${product.name} - ${product.brand?.name || "Korean Skincare"}`,
        description:
          product.description || `${product.name} by ${product.brand?.name}`,
        images: [product.baseImageUrl || "/placeholder.jpg"],
      },
      alternates: {
        canonical: `/products/${resolvedParams.id}`,
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

async function ProductData({ id }: { id: string }) {
  try {
    // Fetch product data server-side
    const product = await getProduct(id);

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

    // Fetch related products server-side
    const [relatedByCategory, relatedByBrand] = await Promise.all([
      getProducts({
        limit: 3,
        category: product.category?.id,
      }),
      getProducts({
        limit: 3,
        brand: product.brand?.id,
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

    return (
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
              href={`/products?category=${product.category?.id}`}
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
    );
  } catch (error) {
    return <ProductErrorState error="Failed to load product" />;
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<ProductLoadingState />}>
      <ProductData id={resolvedParams.id} />
    </Suspense>
  );
}
