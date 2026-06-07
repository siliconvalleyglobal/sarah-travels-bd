import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/flights",
    "/hotels",
    "/visa",
    "/umrah",
    "/tours",
    "/cars",
    "/login",
    "/register",
  ];

  const serviceRoutes = siteConfig.services.map((s) => s.path);

  const paths = [...new Set([...staticRoutes, ...serviceRoutes])];

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/flights" || path === "/hotels" ? 0.9 : 0.8,
  }));
}
