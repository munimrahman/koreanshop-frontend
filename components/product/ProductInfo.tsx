"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cloudfrontLoader } from "@/lib/cloudfront-loader";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Heart,
  ShoppingBag,
  Share2,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Award,
} from "lucide-react";
import { Product, ProductVariation } from "@/lib/api/products";
import { useToast } from "@/hooks/use-toast";
import { addToEnhancedCart } from "@/lib/api/cart";
import { generateEventId } from "@/lib/utils";
import useFbIds from "@/hooks/useFbIds";

interface ProductInfoProps {
  product?: Product; // Add full product object
  name: string;
  description: string;
  brandName: string;
  brandLogo?: string | null;
  averageRating: number;
  reviewCount: number;
  tags: string[];
  variations: ProductVariation[];
}

export function ProductInfo({
  product,
  name,
  description,
  brandName,
  brandLogo,
  averageRating,
  reviewCount,
  tags,
  variations,
}: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { fbclid, fbp } = useFbIds();
  const eventId = generateEventId();
  const fbEventTime = Math.floor(Date.now() / 1000);

  const currentVariant = variations[selectedVariant];
  const isOnSale =
    currentVariant.salePrice &&
    Number(currentVariant.salePrice) < Number(currentVariant.price);
  const displayPrice = isOnSale
    ? currentVariant.salePrice
    : currentVariant.price;
  const originalPrice = isOnSale ? currentVariant.price : null;
  const discountPercentage = isOnSale
    ? Math.round(
        ((Number(originalPrice) - Number(displayPrice)) /
          Number(originalPrice)) *
          100
      )
    : 0;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    // handle fb conversion api
    fetch("/api/fb-conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: "ViewContent",
        eventId: eventId,
        eventTime: fbEventTime,
      }),
    });
  }, []);

  const handleAddToCart = async () => {
    if (!product || !currentVariant) {
      toast({
        title: "Error",
        description: "Product information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingToCart(true);

      const res = await addToEnhancedCart({
        productId: product?.id || "",
        quantity: quantity,
        variantId: currentVariant.id,
      });

      if (res?.data?.cart?.items) {
        // handle pixel and conversion api
        fetch("/api/fb-conversion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: "AddToCart",
            eventId: eventId,
            eventTime: fbEventTime,
          }),
        }).catch(() => {});

        (window as any).fbq(
          "track",
          "AddToCart",
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

      window.dispatchEvent(new Event("cartUpdated"));

      toast({
        title: "Added to Cart! 🛒",
        description: `${quantity} × ${name} added to your cart`,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !currentVariant) {
      toast({
        title: "Error",
        description: "Product information not available",
        variant: "destructive",
      });
      return;
    }
    try {
      setAddingToCart(true);

      await addToEnhancedCart({
        productId: product?.id || "",
        quantity: quantity,
        variantId: currentVariant.id,
      });

      window.dispatchEvent(new Event("cartUpdated"));
      router.push("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Error toast is now handled by the cart API, but show specific message for buy now
      toast({
        title: "Error",
        description: "Failed to proceed to checkout",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Product link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `Check out this amazing product: ${name}`;
    const url = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(text);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    window.open(
      shareUrls[platform as keyof typeof shareUrls],
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {brandLogo && (
              <div className="relative border-2 border-gray-200 rounded-full w-8 h-8 overflow-hidden">
                <Image
                  src={brandLogo}
                  alt={brandName}
                  fill
                  loader={cloudfrontLoader}
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            )}
            <span className="font-medium text-gray-600 dark:text-gray-50 uppercase tracking-wide textext-sm">
              {brandName}
            </span>
          </div>
        </div>

        <h1 className="font-bold text-gray-900 dark:text-gray-200 text-3xl leading-tight">
          {name}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(averageRating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm">
            {averageRating?.toFixed(1) || "0.0"} • {reviewCount || 0} reviews
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-bold text-primary-500 text-4xl">
              ৳{Number(displayPrice).toLocaleString()}
            </span>
            {originalPrice && (
              <>
                <span className="text-gray-400 text-xl line-through">
                  ৳{Number(originalPrice).toLocaleString()}
                </span>
                <Badge variant="destructive" className="bg-red-500">
                  -{discountPercentage}%
                </Badge>
              </>
            )}
          </div>
        </div>
        {product?.expiryDate && (
          <div className="flex items-center gap-2 text-gray-600 text-base">
            <span className="font-semibold">Expiry Date:</span>
            <span>{new Date(product.expiryDate).toLocaleDateString()}</span>
          </div>
        )}
        {/* <p className="text-gray-600 text-lg leading-relaxed">{description}</p> */}
      </div>

      {/* Variants Section */}
      {variations.length > 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">
            Choose Variation
          </h3>
          <div className="gap-3 grid grid-cols-2 sm:grid-cols-3">
            {variations.map((variant, index) => (
              <Button
                key={variant.id}
                variant={selectedVariant === index ? "default" : "outline"}
                onClick={() => setSelectedVariant(index)}
                className={`p-4 h-auto flex-col justify-center text-center transition-all ${
                  selectedVariant === index
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                    : "hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <span className="font-medium">{variant.name}</span>
                {variant.volume && (
                  <span className="opacity-75 text-xs">{variant.volume}</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Quantity</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="hover:bg-gray-100 rounded-none w-12 h-12"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="px-6 py-3 min-w-[80px] font-semibold text-lg text-center">
              {quantity}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setQuantity(
                  Math.min(currentVariant.stockQuantity, quantity + 1)
                )
              }
              disabled={quantity >= currentVariant.stockQuantity}
              className="hover:bg-gray-100 rounded-none w-12 h-12"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {/* <div className="text-gray-600 text-sm">
            <span className="font-medium">{currentVariant.stockQuantity}</span> available
          </div> */}
        </div>
      </div>

      {/* Tags Section */}
      {tags && tags.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 text-gray-700 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4 pt-4">
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
          <Button
            className="bg-primary hover:bg-primary-600 shadow-lg hover:shadow-xl h-14 font-semibold text-lg transition-all"
            onClick={handleAddToCart}
            disabled={addingToCart || currentVariant.stockQuantity === 0}
          >
            <ShoppingBag className="mr-2 w-5 h-5" />
            {addingToCart ? "Adding..." : "Add to Cart"}
          </Button>

          <Button
            variant="outline"
            className="hover:bg-primary-600 border-2 border-primary-600 h-14 font-semibold text-primary-600 hover:text-white text-lg transition-all"
            onClick={handleBuyNow}
            disabled={addingToCart || currentVariant.stockQuantity === 0}
          >
            {addingToCart ? "Processing..." : "Buy Now"}
          </Button>
        </div>

        {/* Share Button */}
        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              size="lg"
            >
              <Share2 className="mr-2 w-5 h-5" />
              Share Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Share this product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input value={currentUrl} readOnly className="flex-1" />
                <Button
                  onClick={copyToClipboard}
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => shareToSocial("facebook")}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                </Button>
                <Button
                  onClick={() => shareToSocial("twitter")}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                </Button>
                <Button
                  onClick={() => shareToSocial("linkedin")}
                  variant="outline"
                  size="icon"
                  className="w-12 h-12"
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Features Section */}
      <div className="pt-6 border-gray-200 dark:border-gray-700 border-t">
        <div className="gap-3 md:gap-6 grid grid-cols-3">
          <div className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 p-3 md:p-4 rounded-lg text-center transition-colors">
            <div className="inline-flex justify-center items-center bg-orange-100 dark:bg-orange-900 mb-2 md:mb-3 rounded-full w-8 h-8 md:w-10 md:h-10">
              <Award className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="mb-1 font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm leading-tight">
              Original Products
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-[10px] md:text-xs leading-tight">
              100% authentic guarantee
            </p>
          </div>
          <div className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 p-3 md:p-4 rounded-lg text-center transition-colors">
            <div className="inline-flex justify-center items-center bg-emerald-100 dark:bg-emerald-900 mb-2 md:mb-3 rounded-full w-8 h-8 md:w-10 md:h-10">
              <Truck className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="mb-1 font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm leading-tight">
              Safe Shipping
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-[10px] md:text-xs leading-tight">
              Fast & secure delivery
            </p>
          </div>
          <div className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 p-3 md:p-4 rounded-lg text-center transition-colors">
            <div className="inline-flex justify-center items-center bg-blue-100 dark:bg-blue-900 mb-2 md:mb-3 rounded-full w-8 h-8 md:w-10 md:h-10">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="mb-1 font-semibold text-gray-900 dark:text-gray-100 text-xs md:text-sm leading-tight">
              Secure Payment
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-[10px] md:text-xs leading-tight">
              100% protected checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
