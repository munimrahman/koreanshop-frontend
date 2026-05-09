import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/utils";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.koreanskincareshopbd.com/api/v1";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${BASE_URL}/shipping`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/support`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
];

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productEntries: MetadataRoute.Sitemap = [];
  const brandSlugs = new Set<string>();
  const categorySlugs = new Set<string>();

  try {
    const response = await fetch(`${API_URL}/products/all`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const data = await response.json();
      const products: any[] = Array.isArray(data)
        ? data
        : data.products ?? data.data ?? data.result ?? [];

      for (const product of products) {
        if (!product.slug) continue;

        productEntries.push({
          url: `${BASE_URL}/products/${product.slug}`,
          lastModified: new Date(product.updatedAt || product.createdAt || Date.now()),
          changeFrequency: "weekly",
          priority: 0.9,
        });

        if (product.brand?.slug) brandSlugs.add(product.brand.slug);
        if (product.category?.slug) categorySlugs.add(product.category.slug);
      }
    }
  } catch {
    // Proceed with static pages only if API is unavailable
  }

  const brandFilterPages: MetadataRoute.Sitemap = Array.from(brandSlugs).map((slug) => ({
    url: `${BASE_URL}/products?brand=${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryFilterPages: MetadataRoute.Sitemap = Array.from(categorySlugs).map((slug) => ({
    url: `${BASE_URL}/products?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...STATIC_PAGES, ...productEntries, ...brandFilterPages, ...categoryFilterPages];
}
