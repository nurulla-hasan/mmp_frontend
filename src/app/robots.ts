import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mouzammappro.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/surveyor",
          "/surveyor/*",
          "/api/*",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-code",
          "/_next/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/*",
          "/dashboard/*",
          "/surveyor/*",
          "/api/*",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-code",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

