import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mouza Map Pro — ডিজিটাল ভূমি পরিমাপ ও সার্ভেয়ার প্ল্যাটফর্ম",
    short_name: "Mouza Map Pro",
    description:
      "অনলাইন মৌজা ম্যাপ এনালাইসিস, জমি পরিমাপ ক্যালকুলেটর, খতিয়ান-দাগ যাচাই এবং সারাদেশের ভেরিফাইড আমিন ও সার্ভেয়ারদের সাথে সরাসরি যোগাযোগের বিশ্বস্ত প্ল্যাটফর্ম।",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

