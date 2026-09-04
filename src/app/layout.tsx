import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Hind_Siliguri,
  Noto_Sans_Bengali,
  Space_Grotesk,
} from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/provider/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BroadcastAnnouncementModal } from "@/components/common/broadcast-announcement-modal";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { cn } from "@/lib/utils";

import "./globals.css";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mouzammappro.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "মৌজা ম্যাপ প্রো — Mouza Map Pro | ডিজিটাল ভূমি পরিমাপ ও সার্ভেয়ার প্ল্যাটফর্ম",
    template: "%s | Mouza Map Pro",
  },
  description:
    "অনলাইন মৌজা ম্যাপ এনালাইসিস, জমি পরিমাপ ক্যালকুলেটর, খতিয়ান-দাগ যাচাই এবং সারাদেশের ভেরিফাইড আমিন ও সার্ভেয়ারদের সাথে সরাসরি যোগাযোগের বিশ্বস্ত প্ল্যাটফর্ম।",
  applicationName: "Mouza Map Pro",
  authors: [{ name: "Mouza Map Pro Team", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "মৌজা ম্যাপ",
    "জমি পরিমাপ ক্যালকুলেটর",
    "আমিন",
    "সার্ভেয়ার",
    "ভূমি পরিমাপ",
    "খতিয়ান",
    "দাগ নম্বর",
    "ডিজিটাল ট্রেসিং",
    "প্যান্টাগ্রাফ",
    "Mouza Map Pro",
    "Land Measurement Bangladesh",
    "Land Surveyor Directory",
    "Mouza Geo Studio",
    "Unit Converter",
    "Inheritance Calculator",
  ],
  creator: "Mouza Map Pro",
  publisher: "Mouza Map Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: siteUrl,
    title: "মৌজা ম্যাপ প্রো — Mouza Map Pro | ডিজিটাল ভূমি পরিমাপ ও সার্ভেয়ার প্ল্যাটফর্ম",
    description:
      "অনলাইন মৌজা ম্যাপ এনালাইসিস, জমি পরিমাপ ক্যালকুলেটর, খতিয়ান-দাগ যাচাই এবং সারাদেশের ভেরিফাইড আমিন ও সার্ভেয়ারদের সাথে সরাসরি যোগাযোগের বিশ্বস্ত প্ল্যাটফর্ম।",
    siteName: "Mouza Map Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "মৌজা ম্যাপ প্রো — Mouza Map Pro | ডিজিটাল ভূমি পরিমাপ ও সার্ভেয়ার প্ল্যাটফর্ম",
    description:
      "অনলাইন মৌজা ম্যাপ এনালাইসিস, জমি পরিমাপ ক্যালকুলেটর, খতিয়ান-দাগ যাচাই এবং সারাদেশের ভেরিফাইড আমিন ও সার্ভেয়ারদের সাথে সরাসরি যোগাযোগের বিশ্বস্ত প্ল্যাটফর্ম।",
    creator: "@mouzammappro",
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
  category: "technology",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mouza Map Pro",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Mouza Map Pro",
      alternateName: "মৌজা ম্যাপ প্রো",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.ico`,
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Mouza Map Pro",
      alternateName: "মৌজা ম্যাপ প্রো",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: ["bn-BD", "en-US"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/surveyors?searchTerm={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans overflow-x-hidden",
        notoSansBengali.variable,
        hindSiliguri.variable,
        spaceGrotesk.variable,
        geistMono.variable,
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col max-w-480 mx-auto">
        <NextTopLoader
          color="var(--primary)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2.5}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
        />
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <BroadcastAnnouncementModal />
          <PwaRegister />
          <PwaInstallPrompt />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
