import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AdminProvider } from "@/contexts/AdminContext";
import { getCategories } from "@/lib/api/categories";
export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Korean Skincare Shop BD - Premium K-Beauty Products",
    template: "%s | Korean Skincare Shop BD",
  },
  description:
    "Bangladesh's premier destination for authentic Korean skincare products. Discover premium K-beauty essentials, serums, moisturizers, and complete skincare routines from top Korean brands.",
  keywords: [
    "Korean skincare",
    "K-beauty",
    "Korean cosmetics Bangladesh",
    "skincare Bangladesh",
    "Korean beauty products",
    "premium skincare",
    "Korean skincare shop",
    "authentic Korean products",
    "K-beauty Bangladesh",
    "Korean skincare routine",
    "skincare essentials",
    "beauty products Bangladesh",
  ],
  authors: [{ name: "Korean Skincare Shop BD" }],
  creator: "Korean Skincare Shop BD",
  publisher: "Korean Skincare Shop BD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.koreanskincareshopbd.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Korean Skincare Shop BD - Premium K-Beauty Products",
    description:
      "Bangladesh's premier destination for authentic Korean skincare products. Shop premium K-beauty essentials from top Korean brands.",
    url: "https://www.koreanskincareshopbd.com",
    siteName: "Korean Skincare Shop BD",
    images: [
      {
        url: "/logo2.png",
        width: 1200,
        height: 630,
        alt: "Korean Skincare Shop BD Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korean Skincare Shop BD - Premium K-Beauty Products",
    description:
      "Bangladesh's premier destination for authentic Korean skincare products.",
    images: ["/logo2.png"],
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { categories } = await getCategories(1, 5);

  // Structured data for the website
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Korean Skincare Shop BD",
    description:
      "Bangladesh's premier destination for authentic Korean skincare products",
    url: "https://www.koreanskincareshopbd.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.koreanskincareshopbd.com/products?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Korean Skincare Shop BD",
      url: "https://www.koreanskincareshopbd.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.koreanskincareshopbd.com/logo2.png",
      },
    },
  };

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <link rel="preload" href="/logo2.png" as="image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        {/* <!-- Google tag (gtag.js) --> */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NPTTRXW8L1"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NPTTRXW8L1');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={inter.className}>
        {" "}
        <ThemeProvider>
          <AdminProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
