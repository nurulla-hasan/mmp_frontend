import type { Metadata } from "next";
import { Geist_Mono, Hind_Siliguri, Noto_Sans_Bengali, Space_Grotesk } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Mouza Map Pro", template: "%s | Mouza Map Pro" },
  description: "Land tools, verified surveyor marketplace and digital land service platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full antialiased font-sans", notoSansBengali.variable, hindSiliguri.variable, spaceGrotesk.variable, geistMono.variable)}>
      <body className="flex min-h-full flex-col max-w-480 mx-auto">
        <ThemeProvider>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
