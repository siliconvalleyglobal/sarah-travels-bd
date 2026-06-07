import { absoluteUrl, siteConfig } from "@/lib/seo/site";

/** Organization + TravelAgency + WebSite schema for Google & AI crawlers. */
export function SiteJsonLd() {
  const url = absoluteUrl("/");

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "TravelAgency"],
        "@id": `${url}#organization`,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url,
        description: siteConfig.description,
        email: siteConfig.email,
        telephone: siteConfig.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.address.addressLocality,
          addressRegion: siteConfig.address.addressRegion,
          addressCountry: siteConfig.address.addressCountry,
        },
        sameAs: Object.values(siteConfig.social),
        areaServed: { "@type": "Country", name: "Bangladesh" },
        knowsAbout: siteConfig.services.map((s) => s.name),
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": `${url}#organization` },
        inLanguage: siteConfig.language,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/flights?origin={origin}&destination={destination}`,
          },
          "query-input": "required name=origin name=destination",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
