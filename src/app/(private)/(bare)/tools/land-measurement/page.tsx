import type { Metadata } from "next";
import { Suspense } from "react";
import MapCalculatorWrapper from "./map-calculator-wrapper";

export const metadata: Metadata = {
  title: "জমি পরিমাপ ও প্লট ক্যালকুলেটর — মৌজা ম্যাপ এনালাইসিস",
  description:
    "মৌজা ম্যাপ আপলোড করে নিখুঁত স্কেলে দাগ ও প্লট অঙ্কন করুন, শতক-কাঠা-বর্গফুটে আয়তন হিসাব করুন এবং প্রফেশনাল রিপোর্ট তৈরি করুন।",
  keywords: [
    "জমি পরিমাপ ক্যালকুলেটর",
    "মৌজা ম্যাপ পরিমাপ",
    "প্লট ক্যালকুলেটর",
    "Land Measurement Calculator",
  ],
  alternates: {
    canonical: "/tools/land-measurement",
  },
  openGraph: {
    title: "জমি পরিমাপ ও প্লট ক্যালকুলেটর | Mouza Map Pro",
    description:
      "মৌজা ম্যাপ আপলোড করে নিখুঁত স্কেলে দাগ ও প্লট অঙ্কন করুন এবং শতক-কাঠা-বর্গফুটে আয়তন হিসাব করুন।",
    url: "/tools/land-measurement",
  },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <MapCalculatorWrapper />
    </Suspense>
  );
}
