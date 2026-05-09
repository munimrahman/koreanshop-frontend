import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Korean Skincare Shop BD. Reach us via WhatsApp, email, or phone for product inquiries, order support, and more.",
  keywords: [
    "contact Korean Skincare Shop BD",
    "customer support K-beauty",
    "skincare shop Bangladesh contact",
    "Korean skincare help",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | Korean Skincare Shop BD",
    description:
      "Reach Korean Skincare Shop BD via WhatsApp, email, or phone for product questions and order support.",
    url: "https://www.koreanskincareshopbd.com/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
