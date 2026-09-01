import type { Metadata } from "next";
import { InheritanceCalculatorClient } from "./_components/inheritance-calculator-client";

export const metadata: Metadata = {
  title: "জমি বণ্টন ও অংশীদারিত্ব ক্যালকুলেটর — অংশীদারদের মধ্যে জমি ভাগ করুন",
  description:
    "মোট জমির পরিমাণ ও অংশীদারদের অনুপাত বা সমান ভাগের ভিত্তিতে নির্ভুলভাবে জমি বণ্টনের ক্যালকুলেটর।",
  keywords: [
    "জমি বণ্টন ক্যালকুলেটর",
    "ফরায়েজ ক্যালকুলেটর",
    "অংশীদারদের জমি ভাগ",
    "Inheritance Calculator Bangladesh",
    "Land Distribution Tool",
  ],
  alternates: {
    canonical: "/tools/inheritance-calculator",
  },
  openGraph: {
    title: "জমি বণ্টন ও অংশীদারিত্ব ক্যালকুলেটর | Mouza Map Pro",
    description:
      "মোট জমির পরিমাণ ও অংশীদারদের অনুপাত বা সমান ভাগের ভিত্তিতে নির্ভুলভাবে জমি বণ্টন করুন।",
    url: "/tools/inheritance-calculator",
  },
};

export default function InheritanceCalculatorPage() {
  return <InheritanceCalculatorClient />;
}
