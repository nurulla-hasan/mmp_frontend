import type { Metadata } from "next";
import { Suspense } from "react";
import PantagraphClientWrapper from "./pantagraph-client-wrapper";

export const metadata: Metadata = {
  title: "ম্যাপ তুলনা ও প্যান্টাগ্রাফ টুল — CS ও BS মৌজা ম্যাপ এলাইনমেন্ট",
  description:
    "প্যান্টাগ্রাফ ও ডিজিটাল স্কেলিং টুলের সাহায্যে একাধিক মৌজা ম্যাপ (CS, SA, RS, BS) পাশাপাশি ও ওভারলে করে দাগের সীমানা তুলনা ও যাচাই করুন।",
  keywords: [
    "প্যান্টাগ্রাফ",
    "মৌজা ম্যাপ তুলনা",
    "CS BS ম্যাপ এলাইন",
    "Pantagraph Tool Bangladesh",
  ],
  alternates: {
    canonical: "/tools/pantagraph",
  },
  openGraph: {
    title: "ম্যাপ তুলনা ও প্যান্টাগ্রাফ টুল | Mouza Map Pro",
    description:
      "একাধিক মৌজা ম্যাপ (CS, SA, RS, BS) পাশাপাশি ও ওভারলে করে দাগের সীমানা তুলনা ও যাচাই করুন।",
    url: "/tools/pantagraph",
  },
};

export default function PantagraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PantagraphClientWrapper />
    </Suspense>
  );
}
