export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  period: string;
  duration: string;
  recommended: boolean;
  tools: readonly string[];
  features: readonly string[];
};

export const FREE_TOOLS = [
  "জমির একক রূপান্তর",
  "জমি বণ্টন ক্যালকুলেটর",
] as const;

export const UNIFIED_PRO_TOOLS = [
  "জমির ক্ষেত্রফল (প্লট মাপ ও ক্যালকুলেশন)",
  "প্যান্টাগ্রাফ (ম্যাপ স্কেল ও এলাইনমেন্ট)",
  "ডিজিটাল ম্যাপ ট্রেসিং",
  "মৌজা ম্যাপ স্টুডিও",
  "মৌজা জিও স্টুডিও",
] as const;

export const UNIFIED_PRO_FEATURES = [
  "সকল প্রো টুলস আনলিমিটেড অ্যাক্সেস",
  "জমির ক্ষেত্রফল ও প্যান্টাগ্রাফ টুল (C.S/B.S ম্যাপ এলাইনমেন্ট)",
  "ডিজিটাল ম্যাপ ট্রেসিং, ম্যাপ স্টুডিও ও মৌজা জিও স্টুডিও",
  "একাধিক প্লট আঁকা, নিখুঁত পরিমাপ ও KMZ এক্সপোর্ট",
  "সীমাহীন প্রজেক্ট স্টোরেজ, ডিভাইস সিঙ্ক ও ক্লাউড ব্যাকআপ",
  "PDF, PNG ও হাই-রেজোলিউশন প্রিন্ট রিপোর্ট (আনলিমিটেড)",
  "২৪/৭ প্রায়োরিটি সাপোর্ট ও সকল নতুন ফিচারে অগ্রাধিকার",
] as const;

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "মাসিক প্রো",
    description: "স্বল্প সময়ের কাজ বা প্রথমবার প্রো ব্যবহার করার জন্য।",
    price: "৳২৯৯",
    period: "/মাস",
    duration: "১ মাস",
    recommended: false,
    tools: UNIFIED_PRO_TOOLS,
    features: UNIFIED_PRO_FEATURES,
  },
  {
    name: "৬ মাস প্রো",
    description: "নিয়মিত হিসাব ও রিপোর্ট তৈরি করা ব্যবহারকারীদের জন্য।",
    price: "৳৯৯৯",
    period: "/৬ মাস",
    duration: "৬ মাস",
    recommended: false,
    tools: UNIFIED_PRO_TOOLS,
    features: UNIFIED_PRO_FEATURES,
  },
  {
    name: "বার্ষিক প্রো",
    description: "পেশাদার ও নিয়মিত ব্যবহারকারীদের জন্য সবচেয়ে সুবিধাজনক প্ল্যান।",
    price: "৳১,৫৯৯",
    period: "/বছর",
    duration: "১ বছর",
    recommended: true,
    tools: UNIFIED_PRO_TOOLS,
    features: UNIFIED_PRO_FEATURES,
  },
];
