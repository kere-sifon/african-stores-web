import type { MetadataRoute } from "next";
import { getAllStoreSlugs, getCities } from "@/lib/stores";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${siteUrl}/stores`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const [slugs, cities] = await Promise.all([
      getAllStoreSlugs(),
      getCities(),
    ]);

    const storeRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${siteUrl}/stores/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
      url: `${siteUrl}/cities/${encodeURIComponent(city)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...cityRoutes, ...storeRoutes];
  } catch {
    return staticRoutes;
  }
}
