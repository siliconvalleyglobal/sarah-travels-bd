import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl, siteConfig } from "./site";

type PageSeoInput = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
};

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  keywords,
  noIndex = false,
  image,
}: PageSeoInput = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;
  const url = absoluteUrl(path);
  const ogImage = image ?? absoluteUrl("/opengraph-image");

  return {
    title: pageTitle,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    metadataBase: new URL(getSiteUrl()),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: "website",
      locale: siteConfig.locale.replace("_", "-"),
      url,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
    category: "travel",
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata(),
  applicationName: siteConfig.shortName,
  authors: [{ name: siteConfig.legalName, url: absoluteUrl("/") }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "ai-content-declaration": "human-authored",
  },
};
