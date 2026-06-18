import type { MetadataRoute } from "next";
import { TOPICS } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/learn"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = TOPICS.map((t) => ({
    url: absoluteUrl(`/${t.pillar}/${t.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...topicRoutes];
}
