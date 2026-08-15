import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const policies = [
  {
    title: "ডিভাইস-ভিত্তিক সুরক্ষিত অ্যাক্সেস",
    icon: (
      <svg
        className="size-5 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
    content:
      "Account sharing এবং অননুমোদিত ব্যবহার কমাতে Pro account-এ device-based access policy প্রযোজ্য হতে পারে। Registered device limit অতিক্রম করলে Admin বা Support-এর মাধ্যমে device lock reset করতে হতে পারে।",
    note: "সঠিক ডিভাইস লিমিট লঞ্চ-এর আগে প্ল্যান পলিসি-তে প্রকাশ করা হবে।",
  },
  {
    title: "ফেয়ার ইউসেজ পলিসি",
    icon: (
      <svg
        className="size-5 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        />
      </svg>
    ),
    content:
      "স্বাভাবিক ব্যক্তিগত ও পেশাদার ল্যান্ড-ওয়ার্কফ্লো-এর জন্য ক্যালকুলেশন প্রজেক্ট, প্লট এবং রিপোর্ট ব্যবহার করা যাবে। অটোমেটেড, অ্যাবিউসিভ অথবা অস্বাভাবিক সিস্টেম ইউসেজ সীমিত করা হতে পারে।",
    note: null,
  },
  {
    title: "সেভ করা ডাটা",
    icon: (
      <svg
        className="size-5 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
        />
      </svg>
    ),
    content:
      "প্ল্যান এক্সপায়ার হওয়ার পর সেভ করা ক্যালকুলেশন-এর অ্যাক্সেস, এডিট এবং এক্সপোর্ট পলিসি লঞ্চ-এর আগে স্পষ্টভাবে প্রকাশ করা হবে।",
    note: null,
  },
];

const paymentItems = [
  {
    title: "সাবস্ক্রিপশন অ্যাক্টিভেশন",
    content:
      "Payment সফলভাবে confirm হওয়ার পরে subscription account-এ সক্রিয় হবে।",
  },
  {
    title: "সাবস্ক্রিপশন মেয়াদ",
    content:
      "প্ল্যান অ্যাক্টিভেশন ডেট থেকে নির্বাচিত মেয়াদ গণনা হবে।",
  },
  {
    title: "পেমেন্ট পদ্ধতি",
    content:
      "সাপোর্টেড পেমেন্ট প্রোভাইডার ও পেমেন্ট মেথড লঞ্চ-এর আগে প্রকাশ করা হবে।",
  },
  {
    title: "রিনিউয়াল",
    content:
      "সাবস্ক্রিপশন রিনিউয়াল ম্যানুয়াল নাকি অটোমেটিক হবে, তা ফাইনাল পলিসি-তে জানানো হবে。",
  },
  {
    title: "ব্যর্থ পেমেন্ট",
    content:
      "পেমেন্ট সম্পন্ন না হলে সাবস্ক্রিপশন অ্যাক্টিভ হবে না।",
  },
  {
    title: "রিফান্ড নীতি",
    content:
      "রিফান্ড ও ক্যান্সেলেশন পলিসি লঞ্চ-এর আগে টার্মস পেজ-এ প্রকাশ করা হবে।",
  },
];

export function PricingPolicies() {
  return (
    <>
      {/* ─── Usage & Security ─────────────────────────────── */}
      <SectionWrapper id="policies" asSection bg="muted">
        <SectionHeading
          badge="ব্যবহার ও নিরাপত্তা"
          title="ব্যবহার ও Account নিরাপত্তা"
          description="Pro plan-এর নিরাপত্তা ও ব্যবহার নীতিমালা সম্পর্কে জানুন।"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {policies.map((policy) => (
            <Card
              key={policy.title}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20"
            >
              <CardContent>
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                  {policy.icon}
                </div>
                <h3 className="text-base font-semibold font-heading">{policy.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {policy.content}
                </p>
                {policy.note && (
                  <div className="mt-4 rounded-lg bg-primary/5 px-3 py-2 text-xs leading-5 text-muted-foreground italic">
                    {policy.note}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── Payment Information ──────────────────────────── */}
      <SectionWrapper id="payment-info">
        <SectionHeading
          badge="পেমেন্ট তথ্য"
          title="Payment এবং Subscription সম্পর্কে"
          description="আপনার subscription ও payment সংক্রান্ত যাবতীয় তথ্য।"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paymentItems.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20"
            >
              <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold font-heading">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {item.content}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Plan, মূল্য ও feature launch-এর আগে পরিবর্তিত হতে পারে।
        </p>
      </SectionWrapper>
    </>
  );
}
