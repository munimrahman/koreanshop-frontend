// Move your previous component logic to a client component
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProduct, getProducts, Product } from '@/lib/api/products';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductTabs } from '@/components/product/ProductTabs';
import { RelatedProducts } from '@/components/product/RelatedProduct';
import { ProductLoadingState } from '@/components/product/ProductLoadingState';
import { ProductErrorState } from '@/components/product/ProductErrorState';


export function ProductDetailPageClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const productData = await getProduct(id);
      setProduct(productData);
      if (productData.reviews && productData.reviews.length > 0) {
        const total = productData.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
        setAverageRating(total / productData.reviews.length);
      } else {
        setAverageRating(0);
      }

      const relatedByCategory = await getProducts({
        limit: 3,
        category: productData.category?.id,
      });

      const relatedByBrand = await getProducts({
        limit: 3,
        brand: productData.brand?.id,
      });

      const relatedProductsData = {
        products: [
          ...relatedByCategory.products,
          ...relatedByBrand.products,
        ].filter(
          (product, index, self) =>
            self.findIndex(p => p.id === product.id) === index
        ),
      };

      const filteredRelatedProducts = relatedProductsData.products.filter(
        (p: Product) => p.id !== productData.id
      );

      setRelatedProducts(filteredRelatedProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <ProductLoadingState />;
  }

  if (error || !product) {
    return <ProductErrorState error={error || "Failed to load product"} />;
  }

  const galleryImages = [product.baseImageUrl, ...product.images.map(img => img.imageUrl)].filter((img): img is string => typeof img === 'string');

  const currentVariation = product.variations[0];
  const isOnSale = !!(currentVariation.salePrice && Number(currentVariation.salePrice) < Number(currentVariation.price));
  const discountPercentage = isOnSale
    ? Math.round((1 - (Number(currentVariation.salePrice) / Number(currentVariation.price))) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-3 container">
        <div className="flex items-center gap-2 mb-5 text-muted-foreground text-sm">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category?.slug || product.category?.id}`} className="hover:text-primary">
            {product.category?.name
              ? product.category.name.length > 10
          ? product.category.name.slice(0, 10) + '...'
          : product.category.name
              : ''}
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {product.name.length > 15
              ? product.name.slice(0, 15) + '...'
              : product.name}
          </span>
        </div>
        <Button variant="ghost" className="mb-2" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Products
          </Link>
        </Button>
        <div className="gap-12 grid grid-cols-1 lg:grid-cols-2 mb-16">
          <ProductGallery
            images={galleryImages}
            name={product.name}
            isOnSale={isOnSale}
            discountPercentage={discountPercentage}
            isNew={new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
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
        <ProductTabs
          product={product}
          onReviewSubmitted={fetchProductData}
        />
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}