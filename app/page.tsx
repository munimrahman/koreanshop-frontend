import { HeroSection } from "@/components/sections/hero-section";
import { BrandsShowcase } from "@/components/sections/brands-showcase";
import { TopProducts } from "@/components/sections/TopProductsServer";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { SaleProducts } from "@/components/sections/SaleProductsServer";
import { HOTProducts } from "@/components/sections/HOTProductsServer";
import { Suspense } from "react";
import type { Metadata } from "next";
import PageViewEvent from "@/components/PixelComponent/PageViewEvent";

// SEO Metadata for Homepage
export const metadata: Metadata = {
  title:
    "Korean Skincare Shop BD - Premium Korean Beauty Products in Bangladesh",
  description:
    "Discover authentic Korean skincare and beauty products in Bangladesh. Shop premium K-beauty essentials, skincare routines, and cosmetics with fast delivery across Dhaka and Bangladesh.",
  keywords:
    "Korean skincare, K-beauty, Korean cosmetics Bangladesh, skincare products Dhaka, Korean beauty shop, authentic Korean products, skincare routine, K-beauty Bangladesh",
  openGraph: {
    title: "Korean Skincare Shop BD - Premium Korean Beauty Products",
    description:
      "Discover authentic Korean skincare and beauty products in Bangladesh. Shop premium K-beauty essentials with fast delivery.",
    images: [
      {
        url: "/logo2.png",
        width: 1200,
        height: 630,
        alt: "Korean Skincare Shop BD",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "Korean Skincare Shop BD",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korean Skincare Shop BD - Premium Korean Beauty Products",
    description:
      "Discover authentic Korean skincare and beauty products in Bangladesh.",
    images: ["/logo2.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google verification code
  },
};

// Loading component for sections
function SectionLoading() {
  return (
    <section className="bg-white dark:bg-gray-900 py-16">
      <div className="mx-auto px-4 container">
        <div className="flex justify-center items-center h-40">
          <div className="border-primary-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Suspense fallback={<SectionLoading />}>
        <TopProducts />
      </Suspense>
      <BrandsShowcase />
      <Suspense fallback={<SectionLoading />}>
        <SaleProducts />
      </Suspense>
      <Suspense fallback={<SectionLoading />}>
        <HOTProducts />
      </Suspense>
      <ReviewsSection />
      <PageViewEvent />
    </div>
  );
}
