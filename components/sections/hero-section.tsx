"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cloudfrontLoader } from "@/lib/cloudfront-loader";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveBanners, type Banner } from "@/lib/api/banners";

// Optimized CSS-based fallback banners - no external images for better performance
const fallbackBanners = [
  {
    id: "fallback-1",
    title: "Discover Your Natural Glow",
    subtitle: "Premium skincare essentials for radiant skin",
    gradient: "from-pink-400 to-purple-500",
    cta: "Shop Skincare",
    linkUrl: "/products?category=skincare",
  },
  {
    id: "fallback-2", 
    title: "Luxury Makeup Collection",
    subtitle: "Professional quality cosmetics for every occasion",
    gradient: "from-rose-400 to-pink-500",
    cta: "Explore Makeup",
    linkUrl: "/products?category=makeup",
  },
  {
    id: "fallback-3",
    title: "Signature Fragrances", 
    subtitle: "Captivating scents that define your presence",
    gradient: "from-violet-400 to-purple-500",
    cta: "Discover Scents",
    linkUrl: "/products?category=fragrances",
  },
];

interface ProcessedBanner {
  id: string;
  imageUrl?: string;
  gradient?: string;
  cta: string;
  linkUrl: string;
}

export function HeroSection() {
  const [banners, setBanners] = useState<ProcessedBanner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const activeBanners = await getActiveBanners();
        console.log(activeBanners);

        if (activeBanners.length > 0) {
          console.log(1);
          // Process API banners - add default title, subtitle, and CTA if not provided
          const processedBanners: ProcessedBanner[] = activeBanners.map(
            (banner, index) => ({
              id: banner.id,
              // title: `Discover Our Latest Collection`, // Default title
              // subtitle: `Premium beauty products that enhance your natural glow`, // Default subtitle
              imageUrl: banner.imageUrl,
              cta: "Shop Now", // Default CTA
              linkUrl: banner.linkUrl || "/products", // Default link
            })
          );

          setBanners(processedBanners);
        } else {
          // Use fallback banners if no active banners
          setBanners(fallbackBanners);
        }
      } catch (error) {
        console.error("Failed to fetch active banners:", error);
        // Use fallback banners on error
        setBanners(fallbackBanners);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Preload the first few images for better performance
  useEffect(() => {
    if (banners.length > 0) {
      banners.slice(0, 2).forEach((banner) => {
        if (banner.imageUrl) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = banner.imageUrl;
          document.head.appendChild(link);
        }
      });
    }
  }, [banners]);

  // Reduce auto-slide frequency for better performance
  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 8000); // Increased from 5000ms to 8000ms
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <section className="relative bg-gray-200 dark:bg-gray-800 w-full" style={{ aspectRatio: '1080/826' }}>
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="text-center">
            <div className="bg-gray-300 dark:bg-gray-700 mx-auto mb-4 rounded w-48 h-8 animate-pulse"></div>
            <div className="bg-gray-300 dark:bg-gray-700 mx-auto mb-8 rounded w-64 h-6 animate-pulse"></div>
            <div className="bg-gray-300 dark:bg-gray-700 mx-auto rounded w-32 h-12 animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative bg-gradient-to-br from-primary-100 dark:from-gray-800 to-primary-200 dark:to-gray-900 w-full" style={{ aspectRatio: '1080/826' }}>
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="mx-auto px-4 text-center container">
            <h1 className="mb-4 font-bold text-2xl md:text-3xl lg:text-4xl leading-tight golden-text">
              Welcome to KOREAN SKINCARE SHOP BD
            </h1>
            <p className="mb-8 text-muted-foreground text-sm md:text-base lg:text-lg">
              Discover premium beauty products for your natural glow
            </p>
            <Button
              asChild
              size="lg"
              className="px-8 py-3 h-auto text-base golden-button">
              <Link href="/products">
                <ShoppingBag className="mr-2 w-5 h-5" />
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: '1080/826' }}>
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Link 
              href={banner.linkUrl} 
              className="block h-full"
              prefetch={false}
            >
              {banner.imageUrl ? (
                <Image
                  src={banner.imageUrl}
                  alt={banner.cta || "Banner image"}
                  fill
                  loader={cloudfrontLoader}
                  className="object-cover cursor-pointer"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${banner.gradient} flex items-center justify-center`}>
                  <div className="text-center text-white p-8">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                      {banner.cta}
                    </h2>
                    <p className="text-lg md:text-xl opacity-90">
                      Premium Beauty Products
                    </p>
                  </div>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="top-1/2 left-4 z-10 absolute bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors -translate-y-1/2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="top-1/2 right-4 z-10 absolute bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors -translate-y-1/2">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <div className="bottom-8 left-1/2 z-10 absolute flex space-x-2 -translate-x-1/2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-primary-400" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
