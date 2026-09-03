import type { Metadata } from "next";
import { getAllPlans } from "@/services/plan.service";
import { getPaymentNumbers, getMySubscription } from "@/services/subscriber.service";
import {
  PricingHero,
  PricingCards,
  FreeVsPro,
  PlanComparison,
  PricingPolicies,
  PricingFaq,
  PricingCta,
} from "./_components";

export const metadata: Metadata = {
  title: "প্রাইসিং ও সাবস্ক্রিপশন প্ল্যান — আপনার প্রয়োজন অনুযায়ী সঠিক প্ল্যান বেছে নিন",
  description:
    "Mouza Map Pro-এর ফ্রি এবং প্রো প্ল্যানসমূহ। মাসিক, ৬ মাস ও বাৎসরিক সাবস্ক্রিপশন প্ল্যানের বিবরণ, ফিচার তুলনা, পলিসি এবং বিস্তারিত মূল্য তালিকা।",
  keywords: [
    "Mouza Map Pro Pricing",
    "প্রাইসিং প্ল্যান",
    "সাবস্ক্রিপশন",
    "জমি পরিমাপ সফটওয়্যার",
    "Land Measurement Pricing",
    "Pro Plan",
  ],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "প্রাইসিং ও সাবস্ক্রিপশন প্ল্যান | Mouza Map Pro",
    description:
      "আপনার কাজের জন্য সঠিক প্ল্যান নির্বাচন করুন। ফ্রি ও প্রো প্ল্যানের ফিচার তুলনা এবং সহজ সাবস্ক্রিপশন।",
    url: "/pricing",
  },
};

export default async function PricingPage() {
  const [plansRes, paymentNumbersRes, mySubRes] = await Promise.allSettled([
    getAllPlans({ isActive: "true", sortBy: "sortOrder" }),
    getPaymentNumbers(),
    getMySubscription(),
  ]);

  const plans =
    plansRes.status === "fulfilled" && plansRes.value.success && plansRes.value.data
      ? plansRes.value.data
      : [];

  const paymentNumbers =
    paymentNumbersRes.status === "fulfilled" &&
    paymentNumbersRes.value.success &&
    paymentNumbersRes.value.data
      ? paymentNumbersRes.value.data
      : undefined;

  const mySubscription =
    mySubRes.status === "fulfilled" &&
    mySubRes.value.success &&
    mySubRes.value.data
      ? mySubRes.value.data
      : undefined;

  return (
    <>
      <PricingHero />
      <PricingCards
        plans={plans}
        paymentNumbers={paymentNumbers}
        mySubscription={mySubscription}
      />
      <FreeVsPro />
      <PlanComparison plans={plans} />
      <PricingPolicies />
      <PricingFaq />
      <PricingCta />
    </>
  );
}
