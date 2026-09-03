import type { Metadata } from "next";
import { UnitConverterClient } from "./_components/unit-converter-client";

export const metadata: Metadata = {
  title: "জমির একক রূপান্তর ক্যালকুলেটর — শতক, কাঠা, বিঘা, একর, বর্গফুট",
  description:
    "সহজে এবং নির্ভুলভাবে শতক, কাঠা, বিঘা, একর, বর্গফুট, বর্গমিটার ও হেক্টরের মধ্যে জমির পরিমাপ কনভার্ট করুন।",
  keywords: [
    "জমির একক রূপান্তর",
    "শতক থেকে কাঠা",
    "কাঠা থেকে বিঘা",
    "বিঘা থেকে একর",
    "বর্গফুট থেকে শতক",
    "Land Unit Converter Bangladesh",
  ],
  alternates: {
    canonical: "/tools/unit-converter",
  },
  openGraph: {
    title: "জমির একক রূপান্তর ক্যালকুলেটর | Mouza Map Pro",
    description:
      "সহজে এবং নির্ভুলভাবে শতক, কাঠা, বিঘা, একর, বর্গফুট ও বর্গমিটারে জমির পরিমাপ কনভার্ট করুন।",
    url: "/tools/unit-converter",
  },
};

export default function UnitConverterPage() {
  return <UnitConverterClient />;
}
