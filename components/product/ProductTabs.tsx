"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductReviews } from "./ProductReviews";
import { Product } from "@/lib/api/products";
import {
  getAllShippingCharges,
  ShippingChargesResponse,
} from "@/lib/api/shipping";

interface ProductTabsProps {
  product: Product;
  onReviewSubmitted: () => void;
}

export function ProductTabs({ product, onReviewSubmitted }: ProductTabsProps) {
  const reviewCount = product.reviews.length;
  const [shippingCharges, setShippingCharges] = useState<
    ShippingChargesResponse["data"] | null
  >(null);

  useEffect(() => {
    getAllShippingCharges()
      .then((res: ShippingChargesResponse) => setShippingCharges(res.data))
      .catch((err) => {
        console.error("Error loading shipping charges:", err);
        // Set fallback shipping charges if API fails
        setShippingCharges({
          dhaka: 80,
          outsideDhaka: 150,
          details: [
            {
              id: 'fallback-dhaka',
              region: 'dhaka',
              charge: 80,
              description: 'Standard delivery within Dhaka',
              updatedAt: new Date().toISOString()
            },
            {
              id: 'fallback-outside',
              region: 'outside_dhaka',
              charge: 150,
              description: 'Standard delivery outside Dhaka',
              updatedAt: new Date().toISOString()
            }
          ]
        });
      });
  }, []);

  return (
    <Tabs defaultValue="description" className="mb-16">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviewCount || 0})</TabsTrigger>
      </TabsList>

      {/* Description Tab */}
      <TabsContent value="description" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Product Description</h3>
            <div className="mb-6 text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </div>

            {product.tags?.length > 0 && (
              <>
                <h4 className="mb-3 font-semibold">Tags</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Details Tab */}
      <TabsContent value="details" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Product Details</h3>
            <div className="space-y-4">
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <p className="font-medium text-sm">Brand</p>
                  <p className="text-muted-foreground">{product.brand?.name}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Category</p>
                  <p className="text-muted-foreground">
                    {product.category?.name}
                  </p>
                </div>
                {product.variations[0]?.volume && (
                  <div>
                    <p className="font-medium text-sm">Volume</p>
                    <p className="text-muted-foreground">
                      {product.variations[0].volume}
                    </p>
                  </div>
                )}
                {product.variations[0]?.weightGrams && (
                  <div>
                    <p className="font-medium text-sm">Weight</p>
                    <p className="text-muted-foreground">
                      {product.variations[0].weightGrams}g
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Shipping Tab */}
      <TabsContent value="shipping" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Shipping Information</h3>
            <p className="mb-4 text-muted-foreground">
              We offer standard shipping on all orders, with delivery times
              varying by location.
            </p>

            {shippingCharges ? (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Delivery Charges</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Inside Dhaka: ৳{shippingCharges.dhaka}</li>
                    <li>• Outside Dhaka: ৳{shippingCharges.outsideDhaka}</li>
                  </ul>
                </div>
                {shippingCharges.details.length > 0 && (
                  <div>
                    <h4 className="mt-4 mb-2 font-medium">More Details</h4>
                    <ul className="space-y-1 ml-6 text-muted-foreground text-sm list-disc">
                      {shippingCharges.details.map((item) => (
                        <li key={item.id}>
                          <strong className="capitalize">
                            {item.region.replace("_", " ")}:
                          </strong>{" "}
                          ৳{item.charge} — {item.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Loading shipping details...
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews" className="mt-6">
        <ProductReviews
          productId={product.id}
          reviews={product.reviews}
          onReviewSubmitted={onReviewSubmitted}
        />
      </TabsContent>
    </Tabs>
  );
}
