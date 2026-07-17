import Link from "next/link";
import { PageWrapper } from "@/components/ui/custom/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";
import { DashboardPage } from "@/components/shared/dashboard-page";

export function formatRouteValue(value: string) {
  return decodeURIComponent(value).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PublicDynamicPage({ label, value, description }: { label: string; value: string; description: string }) {
  const formatted = formatRouteValue(value);
  return (
    <PageWrapper>
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="ব্রেডক্রাম্ব">
        <Link href="/" className="hover:text-foreground">হোম</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{label}</span>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{formatted}</span>
      </nav>
      <section className="max-w-3xl">
        <p className="mb-2 text-sm font-medium text-primary">{label}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">{formatted}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="ওভারভিউ" description={`${formatted}-এর জন্য প্রাথমিক ওভারভিউ।`} href="#" />
        <RouteCard title="সংশ্লিষ্ট তথ্য" description="সংশ্লিষ্ট কন্টেন্ট পরে এখানে সংযুক্ত হবে।" href="#" />
      </section>
    </PageWrapper>
  );
}

export function DashboardDynamicPage({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <DashboardPage
      title={`${label}: ${formatRouteValue(value)}`}
      description={description}
      showBack
      cards={[
        { label: "স্ট্যাটাস", value: "প্লেসহোল্ডার", description: "বাস্তব স্ট্যাটাস ব্যাকএন্ড সংযুক্ত হলে দেখা যাবে।" },
        { label: "কার্যক্রম", description: "এখানে একটি টাইমলাইন এবং সম্পর্কিত রেকর্ড দেখানো হবে।" },
      ]}
    />
  );
}
