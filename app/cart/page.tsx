"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Heart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getEnhancedCart,
  updateCartItemQuantity,
  removeCartItem,
  prepareCheckout,
  CartItem,
} from "@/lib/api/cart";
import { getProduct, Product, ProductVariation } from "@/lib/api/products";
import { useRouter } from "next/navigation";
import useFbIds from "@/hooks/useFbIds";
import { generateEventId } from "@/lib/utils";
interface CartItemWithProduct extends CartItem {
  product?: Product;
  variation?: ProductVariation;
  loading?: boolean;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();
  const { fbclid, fbp } = useFbIds();
  const fbEventTime = Math.floor(Date.now() / 1000);
  const eventId = generateEventId();

  // Fetch cart data and product details
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);

        // Get cart items
        const cartResponse = await getEnhancedCart();

        // Handle empty cart case
        if (
          !cartResponse.data.cart.items ||
          cartResponse.data.cart.items.length === 0
        ) {
          setItems([]);
          setLoading(false);
          return;
        }

        const cartItems = cartResponse.data.cart.items;

        // Convert cart items to our interface with loading state
        const cartItemsWithProduct: CartItemWithProduct[] = cartItems.map(
          (item) => ({
            ...item, // This includes productId, variantId, quantity, totalPrice, productData, etc.
            loading: true,
          })
        );

        setItems(cartItemsWithProduct);

        // Fetch detailed product and variation data for each item
        const updatedItems = await Promise.all(
          cartItemsWithProduct.map(async (item) => {
            try {
              const product = await getProduct(item.productId);

              // Find the specific variation using variantId from cart
              const variation = product.variations.find(
                (v) => v.id === item.variantId
              );

              return {
                ...item,
                product,
                variation,
                loading: false,
              };
            } catch (error) {
              console.error(
                `Failed to fetch product ${item.productId}:`,
                error
              );
              return {
                ...item,
                loading: false,
              };
            }
          })
        );

        setItems(updatedItems);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        toast({
          title: "Error",
          description: "Failed to load cart items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [toast]);

  const updateQuantity = async (
    item: CartItemWithProduct,
    newQuantity: number
  ) => {
    if (newQuantity === 0) {
      await removeItem(item);
      return;
    }

    try {
      // Optimistically update the UI
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.productId === item.productId &&
          prevItem.variantId === item.variantId
            ? { ...prevItem, quantity: newQuantity }
            : prevItem
        )
      );

      // Update stock on server using variation ID
      const variationId = item.variation?.id || item.variantId;
      console.log(item);
      await updateCartItemQuantity(variationId, newQuantity);

      toast({
        title: "Success",
        description: "Cart updated successfully",
      });
    } catch (error) {
      console.error("Failed to update cart item:", error);

      // Revert optimistic update
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.productId === item.productId &&
          prevItem.variantId === item.variantId
            ? { ...prevItem, quantity: item.quantity }
            : prevItem
        )
      );

      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (item: CartItemWithProduct) => {
    try {
      // Optimistically remove item from UI
      setItems((prevItems) =>
        prevItems.filter(
          (prevItem) =>
            !(
              prevItem.productId === item.productId &&
              prevItem.variantId === item.variantId
            )
        )
      );

      // Remove from server
      await removeCartItem(item.productId, item.variantId);

      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error("Failed to remove cart item:", error);

      // Revert optimistic update - add the item back
      setItems((prevItems) => [...prevItems, item]);

      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  // Calculate totals using actual prices from variation or fallback to cart data
  const subtotal = items.reduce((sum, item) => {
    const currentPrice = item.variation?.price || item.productData?.price;
    return sum + currentPrice * item.quantity;
  }, 0);

  const savings = items.reduce((sum, item) => {
    if (item.variation?.price && item.variation?.salePrice) {
      return (
        sum + (item.variation.price - item.variation.salePrice) * item.quantity
      );
    }
    return sum;
  }, 0);

  const handleProceedToCheckout = async () => {
    try {
      setCheckoutLoading(true);

      // Prepare cart for checkout
      const res = await prepareCheckout();

      if (res?.data?.enhanced) {
        // handle pixel and conversion api
        fetch("/api/fb-conversion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: "InitiateCheckout",
            eventId: eventId,
            eventTime: fbEventTime,
          }),
        }).catch(() => {});

        (window as any).fbq(
          "track",
          "InitiateCheckout",
          {
            currency: "BDT",
          },
          {
            eventID: eventId,
            fbc: fbclid,
            fbp,
          }
        );
      }
      toast({
        title: "Success",
        description: "Cart prepared for checkout",
      });

      // Navigate to checkout page
      router.push("/checkout");
    } catch (error) {
      console.error("Failed to prepare checkout:", error);

      let errorMessage = "Failed to prepare checkout";

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Cart not found. Please refresh and try again.";
        } else if (error.message.includes("400")) {
          errorMessage =
            "Cart validation failed. Please check your items and try again.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const total = subtotal - savings;

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-50 dark:bg-gray-900 px-4 min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 w-8 h-8 animate-spin" />
          <p className="text-sm sm:text-base">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mx-auto px-4 py-8 sm:py-16 max-w-4xl container">
          <div className="text-center">
            <ShoppingBag className="mx-auto mb-4 sm:mb-6 w-16 sm:w-24 h-16 sm:h-24 text-muted-foreground" />
            <h1 className="mb-2 sm:mb-4 font-bold text-2xl sm:text-3xl">
              Your cart is empty
            </h1>
            <p className="mb-6 sm:mb-8 px-4 text-muted-foreground text-sm sm:text-base">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Button asChild className="w-full sm:w-auto golden-button">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto px-4 py-4 sm:py-8 max-w-7xl container">
        {/* Header */}
        <div className="flex sm:flex-row flex-col sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="ghost" asChild className="self-start sm:self-auto">
            <Link href="/products">
              <ArrowLeft className="mr-2 w-4 h-4" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-2xl sm:text-3xl">Shopping Cart</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {items.length} {items.length === 1 ? "item" : "items"} in your
              cart
            </p>
          </div>
        </div>

        <div className="gap-4 lg:gap-8 grid grid-cols-1 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            {items.map((item, index) => (
              <motion.div
                key={`${item.productId}-${item.variantId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    {item.loading ? (
                      <div className="flex justify-center items-center h-20 sm:h-24">
                        <Loader2 className="w-5 sm:w-6 h-5 sm:h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="flex sm:flex-row flex-col gap-3 sm:gap-4 lg:gap-6">
                        {/* Product Image */}
                        <div className="relative flex-shrink-0 w-full sm:w-20 lg:w-24 h-48 sm:h-20 lg:h-24">
                          <Image
                            src={
                              item.variation?.imageUrl ||
                              item.productData?.imageUrl ||
                              item.product?.baseImageUrl ||
                              item.product?.images?.[0]?.imageUrl ||
                              "/placeholder.jpg"
                            }
                            alt={
                              item.productData?.name ||
                              item.product?.name ||
                              "Product"
                            }
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-2 sm:space-y-3">
                          {/* Product Info & Actions */}
                          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                                {item.product?.brand?.name}
                              </p>
                              <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                                {item.productData?.name ||
                                  item.product?.name ||
                                  "Unknown Product"}
                              </h3>
                              {item.productData?.variantName && (
                                <p className="text-muted-foreground text-xs sm:text-sm">
                                  variation: {item.productData.variantName}
                                </p>
                              )}
                              {item.variation?.volume && (
                                <p className="text-muted-foreground text-xs sm:text-sm">
                                  Volume: {item.variation.volume}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex self-end sm:self-start gap-1 sm:gap-2">
                              {/* <Button size="icon" variant="ghost" className="w-8 sm:w-10 h-8 sm:h-10">
                                <Heart className="w-3 sm:w-4 h-3 sm:h-4" />
                              </Button> */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeItem(item)}
                                className="w-8 sm:w-10 h-8 sm:h-10 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Price & Quantity */}
                          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm sm:text-base golden-text">
                                {Number(
                                  item.variation?.salePrice ??
                                    item.variation?.price ??
                                    item.productData?.price ??
                                    0
                                ).toFixed(2)}
                              </span>
                              {item.variation?.price &&
                                item.variation?.salePrice &&
                                Number(item.variation.price) >
                                  Number(item.variation.salePrice) && (
                                  <span className="text-muted-foreground text-xs sm:text-sm line-through">
                                    ৳{Number(item.variation.price).toFixed(2)}
                                  </span>
                                )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center self-end sm:self-auto border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item, item.quantity - 1)
                                }
                                className="w-7 sm:w-8 h-7 sm:h-8"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="px-2 sm:px-3 py-1 min-w-[32px] sm:min-w-[40px] text-xs sm:text-sm text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item, item.quantity + 1)
                                }
                                className="w-7 sm:w-8 h-7 sm:h-8"
                                disabled={
                                  item.variation?.stockQuantity
                                    ? item.quantity >=
                                      item.variation.stockQuantity
                                    : false
                                }
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Total Price for this item */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-xs sm:text-sm golden-text">
                              Total:&nbsp; ৳
                              {(
                                Number(
                                  item.variation?.salePrice ??
                                    item.variation?.price ??
                                    item.productData?.price ??
                                    0
                                ) * item.quantity
                              ).toFixed(2)}
                            </span>
                            {item.variation?.price &&
                              item.variation?.salePrice &&
                              Number(item.variation.price) >
                                Number(item.variation.salePrice) && (
                                <span className="text-muted-foreground text-xs sm:text-sm line-through">
                                  ৳
                                  {(
                                    Number(item.variation.price) * item.quantity
                                  ).toFixed(2)}
                                </span>
                              )}
                          </div>

                          {/* Stock Warning */}
                          {item.variation?.stockQuantity &&
                            item.variation.stockQuantity <= 5 && (
                              <p className="text-orange-600 text-xs sm:text-sm">
                                Only {item.variation.stockQuantity} left in
                                stock
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="lg:top-8 lg:sticky">
              <CardContent className="p-4 sm:p-6">
                <h2 className="mb-4 sm:mb-6 font-semibold text-lg sm:text-xl">
                  Order Summary
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toFixed(2)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                      <span>Savings</span>
                      <span>-৳{savings.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold text-base sm:text-lg">
                    <span>Total</span>
                    <span className="golden-text">৳{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="space-y-3 mt-4 sm:mt-6">
                  <div className="flex sm:flex-row flex-col gap-2">
                    <Input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button variant="outline" className="text-sm sm:text-base">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="mt-4 sm:mt-6 w-full text-sm sm:text-base golden-button"
                  size="lg"
                  onClick={handleProceedToCheckout}
                  disabled={checkoutLoading || items.length === 0}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Preparing Checkout...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>

                {/* Security Info */}
                <div className="mt-3 sm:mt-4 text-center">
                  <p className="text-muted-foreground text-xs">
                    Cash on delivery option
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
