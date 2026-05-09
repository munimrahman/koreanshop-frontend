import { Suspense } from "react";
import ProductsPageContent from "./ProductPageClient";
import { ProductsLoading } from "./ProductPageLoading";
import PageViewEvent from "@/components/PixelComponent/PageViewEvent";
import type { Metadata } from "next";
import { getProducts } from "@/lib/api/products";
import { getBrands } from "@/lib/api/brands";
import { getCategories } from "@/lib/api/categories";
import { BASE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'Korean Skincare Products | Premium K-Beauty | Korean Skincare Shop BD',
  description: 'Browse our complete collection of authentic Korean skincare and beauty products. Shop premium K-beauty essentials, serums, creams, masks, and more from trusted Korean brands.',
  keywords: ['Korean skincare products', 'K-beauty products', 'Korean cosmetics', 'skincare Bangladesh', 'Korean beauty products Bangladesh', 'serums', 'moisturizers', 'sheet masks'],
  openGraph: {
    title: 'Korean Skincare Products Collection',
    description: 'Discover premium Korean skincare and beauty products.',
    url: 'https://www.koreanskincareshopbd.com/products',
    type: 'website',
    images: [{ url: '/logo2.png', width: 1200, height: 630, alt: 'Korean Skincare Products' }],
  },
};

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const page = Math.max(1, parseInt(String(params.page || '1')) || 1);
  const perPage = Math.max(1, parseInt(String(params.per_page || '48')) || 48);
  const search = String(params.search || '');
  const category = String(params.category || '');
  const brand = String(params.brand || '');

  const [productsResult, brandsResult, categoriesResult] = await Promise.allSettled([
    getProducts({
      page,
      limit: perPage,
      search: search || undefined,
      category: category || undefined,
      brand: brand || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    getBrands(1, 100),
    getCategories(1, 100),
  ]);

  const productsData = productsResult.status === 'fulfilled' ? productsResult.value : null;
  const initialProducts = productsData?.products ?? [];
  const initialPagination = productsData
    ? {
        page: productsData.page,
        limit: productsData.limit,
        total: productsData.total,
        totalPages: productsData.totalPages,
        hasNext: productsData.hasNext,
        hasPrev: productsData.hasPrev,
      }
    : { page: 1, limit: perPage, total: 0, totalPages: 0, hasNext: false, hasPrev: false };
  const initialBrands = brandsResult.status === 'fulfilled' ? brandsResult.value.data.brands : [];
  const initialCategories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.categories : [];

  const collectionSchema = initialProducts.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Korean Skincare Products",
        description:
          "Browse our complete collection of authentic Korean skincare and beauty products.",
        url: `${BASE_URL}/products`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: initialProducts.map(
            (
              p: { id: string; slug?: string; name: string; baseImageUrl?: string },
              idx: number
            ) => ({
              "@type": "ListItem",
              position: idx + 1,
              name: p.name,
              url: `${BASE_URL}/products/${p.slug || p.id}`,
              image: p.baseImageUrl || undefined,
            })
          ),
        },
      }
    : null;

  return (
    <>
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}
      <Suspense fallback={<ProductsLoading />}>
        <ProductsPageContent
          initialProducts={initialProducts}
          initialBrands={initialBrands}
          initialCategories={initialCategories}
          initialPagination={initialPagination}
        />
        <PageViewEvent />
      </Suspense>
    </>
  );
}
