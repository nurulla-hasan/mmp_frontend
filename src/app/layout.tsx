import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Mouza Map Pro", template: "%s | Mouza Map Pro" },
  description: "Land tools, verified surveyor marketplace and digital land service platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full antialiased font-sans", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
      <body className="flex min-h-full flex-col max-w-480 mx-auto">
        <ThemeProvider>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
