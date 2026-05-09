import { Suspense } from 'react';
import BrandsPageContent from './BrandsPageClient';
import { BrandsLoading } from './BrandsPageLoading';
import type { Metadata } from 'next';
import { getBrands } from '@/lib/api/brands';
import { BASE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Premium Korean Beauty Brands | Korean Skincare Shop BD',
  description: 'Explore top Korean skincare and beauty brands available in Bangladesh. Shop authentic products from leading K-beauty brands like COSRX, Purito, Isntree, and more.',
  keywords: ['Korean brands', 'K-beauty brands', 'skincare brands', 'COSRX', 'Korean beauty brands Bangladesh'],
  openGraph: {
    title: 'Korean Beauty Brands',
    description: 'Discover top Korean skincare and beauty brands.',
    url: 'https://www.koreanskincareshopbd.com/brands',
    type: 'website',
    images: [{ url: '/logo2.png', width: 1200, height: 630, alt: 'Korean Beauty Brands' }],
  },
};

export default async function BrandsPage() {
  const brandsResult = await getBrands(1, 20).catch(() => null);

  const initialBrands = brandsResult?.data.brands ?? [];
  const initialPagination = brandsResult?.data.pagination ?? {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const brandsSchema = initialBrands.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Korean Beauty Brands",
        description: "Top Korean skincare and beauty brands available in Bangladesh.",
        url: `${BASE_URL}/brands`,
        itemListElement: initialBrands.map((brand, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: brand.name,
          url: `${BASE_URL}/products?brand=${brand.slug || brand.id}`,
          image: brand.logoUrl || undefined,
        })),
      }
    : null;

  return (
    <>
      {brandsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandsSchema) }}
        />
      )}
      <Suspense fallback={<BrandsLoading />}>
        <BrandsPageContent
          initialBrands={initialBrands}
          initialPagination={initialPagination}
        />
      </Suspense>
    </>
  );
}
