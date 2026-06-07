import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { rootMetadata } from "@/lib/seo/metadata";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#02132F" },
    { media: "(prefers-color-scheme: dark)", color: "#02132F" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, display.variable, mono.variable, bengali.variable)}
    >
      <body className="font-sans text-base antialiased">
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
