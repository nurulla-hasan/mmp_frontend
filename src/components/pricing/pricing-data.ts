export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  period: string;
  duration: string;
  recommended: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "মাসিক প্রো",
    description: "স্বল্প সময়ের কাজ বা প্রথমবার প্রো ব্যবহার করার জন্য।",
    price: "৳০",
    period: "/মাস",
    duration: "১ মাস",
    recommended: false,
  },
  {
    name: "৬ মাস প্রো",
    description: "নিয়মিত হিসাব ও রিপোর্ট তৈরি করা ব্যবহারকারীদের জন্য।",
    price: "৳০",
    period: "/৬ মাস",
    duration: "৬ মাস",
    recommended: false,
  },
  {
    name: "বার্ষিক প্রো",
    description: "পেশাদার ও নিয়মিত ব্যবহারকারীদের জন্য সবচেয়ে সুবিধাজনক প্ল্যান।",
    price: "৳০",
    period: "/বছর",
    duration: "১ বছর",
    recommended: true,
  },
];

export const PRICING_FEATURES = [
  "সব ৩টি অ্যাডভান্সড টুলে পূর্ণ অ্যাক্সেস",
  "ফেয়ার ইউসেজ অনুযায়ী প্রজেক্ট তৈরি",
  "একাধিক প্লট পরিমাপ ও ভাগ করা",
  "প্যান্টাগ্রাফ ম্যাপ এলাইনমেন্ট ও তুলনা",
  "মাল্টি-লেয়ার ম্যাপ ট্রেসিং",
  "প্রজেক্ট সেভ, PDF/PNG এক্সপোর্ট এবং প্রিন্ট রিপোর্ট",
] as const;
