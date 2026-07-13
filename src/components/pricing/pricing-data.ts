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
    name: "Monthly Pro",
    description: "স্বল্প সময়ের কাজ বা প্রথমবার Pro ব্যবহার করার জন্য।",
    price: "৳৯৯",
    period: "/মাস",
    duration: "১ মাস",
    recommended: false,
  },
  {
    name: "6 Months Pro",
    description: "নিয়মিত হিসাব ও report তৈরি করা ব্যবহারকারীদের জন্য।",
    price: "৳৫৯৯",
    period: "/৬ মাস",
    duration: "৬ মাস",
    recommended: false,
  },
  {
    name: "Yearly Pro",
    description: "পেশাদার ও নিয়মিত ব্যবহারকারীদের জন্য সবচেয়ে সুবিধাজনক plan।",
    price: "৳৯৯৯",
    period: "/বছর",
    duration: "১ বছর",
    recommended: true,
  },
];

export const PRICING_FEATURES = [
  "Fair usage অনুযায়ী calculation project",
  "Multiple plot calculation",
  "Calculation project save",
  "Continue editing later",
  "PDF/Print report",
  "Priority product updates",
  "Device-based secure access",
] as const;
