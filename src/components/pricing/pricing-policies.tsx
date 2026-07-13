import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const policies = [
  {
    title: "Device-based Secure Access",
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
    note: "Exact device limit launch-এর আগে plan policy-তে প্রকাশ করা হবে।",
  },
  {
    title: "Fair Usage Policy",
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
      "স্বাভাবিক ব্যক্তিগত ও professional land-workflow-এর জন্য calculation project, plot এবং report ব্যবহার করা যাবে। Automated, abusive অথবা অস্বাভাবিক system usage সীমিত করা হতে পারে।",
    note: null,
  },
  {
    title: "Saved Data",
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
      "Plan expire হওয়ার পর saved calculation-এর access, edit এবং export policy launch-এর আগে স্পষ্টভাবে প্রকাশ করা হবে।",
    note: null,
  },
];

const paymentItems = [
  {
    title: "Subscription Activation",
    content:
      "Payment সফলভাবে confirm হওয়ার পরে subscription account-এ সক্রিয় হবে।",
  },
  {
    title: "Subscription Duration",
    content:
      "Plan activation date থেকে নির্বাচিত মেয়াদ গণনা হবে।",
  },
  {
    title: "Payment Method",
    content:
      "Supported payment provider ও payment method launch-এর আগে প্রকাশ করা হবে।",
  },
  {
    title: "Renewal",
    content:
      "Subscription renewal manual নাকি automatic হবে, তা final policy-তে জানানো হবে।",
  },
  {
    title: "Failed Payment",
    content:
      "Payment সম্পন্ন না হলে subscription active হবে না।",
  },
  {
    title: "Refund Policy",
    content:
      "Refund ও cancellation policy launch-এর আগে Terms page-এ প্রকাশ করা হবে।",
  },
];

export function PricingPolicies() {
  return (
    <>
      <SectionWrapper id="policies" asSection bg="muted">
        <SectionHeading
          badge="Usage & Security"
          title="ব্যবহার ও Account নিরাপত্তা"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
            {policies.map((policy) => (
              <Card key={policy.title} className="transition-all duration-200 hover:shadow-md">
                <CardContent>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/5">
                    {policy.icon}
                  </div>
                  <h3 className="text-base font-semibold font-heading">{policy.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {policy.content}
                  </p>
                  {policy.note && (
                    <p className="mt-3 text-xs text-muted-foreground/70 italic">
                      {policy.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionWrapper>

      <SectionWrapper>
        <SectionHeading
          badge="Payment Information"
          title="Payment এবং Subscription সম্পর্কে"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paymentItems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md"
            >
              <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-primary/5">
                <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Plan, মূল্য ও feature launch-এর আগে পরিবর্তিত হতে পারে।
        </p>
      </SectionWrapper>
    </>
  );
}
