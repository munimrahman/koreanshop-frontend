// components/ui/quick-view-modal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudfrontLoader } from "@/lib/cloudfront-loader";
import { X, ShoppingBag, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/api/products";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const getMainImage = (product: Product): string => {
    const mainImage = product.images?.find((img) => img.isMainImage);
    return (
      mainImage?.imageUrl || product.baseImageUrl || "/placeholder-product.png"
    );
  };

  const currentVariation =
    product.variations[selectedVariation] || product.variations[0];
  const price = currentVariation?.salePrice || currentVariation?.price || 0;
  const originalPrice = currentVariation?.salePrice
    ? currentVariation.price
    : null;

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4"
      onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="relative p-6">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="top-4 right-4 z-10 absolute"
            onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>

          <div className="gap-8 grid grid-cols-1 md:grid-cols-2">
            {/* Product Image */}
            <div className="relative rounded-lg aspect-square overflow-hidden">
              <Image
                src={getMainImage(product)}
                alt={product.name}
                fill
                loader={cloudfrontLoader}
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-product.png";
                }}
              />

              {/* Additional Images */}
              {product.images && product.images.length > 1 && (
                <div className="right-2 bottom-2 left-2 absolute flex gap-2 overflow-x-auto">
                  {product.images.slice(0, 4).map((image, index) => (
                    <div
                      key={image.id}
                      className="relative flex-shrink-0 rounded-md w-16 h-16 overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        loader={cloudfrontLoader}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-muted-foreground text-sm">
                  {product.brand?.name}
                </p>
                <h2 className="mb-2 font-bold text-2xl">{product.name}</h2>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-2xl golden-text">
                    ৳{price}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-muted-foreground text-lg line-through">
                      ৳{originalPrice}
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex gap-2 mb-4">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <div className="text-muted-foreground text-sm line-clamp-3 whitespace-pre-wrap">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Variations */}
              {product.variations.length > 1 && (
                <div>
                  <h3 className="mb-2 font-semibold">Options</h3>
                  <div className="gap-2 grid grid-cols-2">
                    {product.variations.map((variation, index) => (
                      <button
                        key={variation.id}
                        onClick={() => setSelectedVariation(index)}
                        className={`p-2 text-sm border rounded-md text-left ${
                          selectedVariation === index
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <div className="font-medium">{variation.name}</div>
                        {variation.volume && (
                          <div className="text-muted-foreground text-xs">
                            {variation.volume}
                          </div>
                        )}
                        <div className="font-semibold text-sm">
                          ৳
                          {Number(
                            variation.salePrice || variation.price
                          ).toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="mb-2 font-semibold">Quantity</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button className="w-full golden-button" size="lg">
                  <ShoppingBag className="mr-2 w-5 h-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <Link href={`/products/${product.slug || product.id}`}>
                    View Full Details
                  </Link>
                </Button>
              </div>

              {/* Stock Status */}
              {currentVariation && (
                <div className="text-muted-foreground text-sm">
                  {currentVariation.stockQuantity > 0 ? (
                    <span className="text-green-600">
                      In Stock ({currentVariation.stockQuantity} available)
                    </span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
