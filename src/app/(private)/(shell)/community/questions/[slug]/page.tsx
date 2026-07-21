import Link from "next/link";

import { PageWrapper } from "@/components/ui/custom/page-wrapper";

function formatRouteValue(value: string) {
  return decodeURIComponent(value).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const formatted = formatRouteValue(slug);

  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-6">
        <nav className="text-sm text-muted-foreground" aria-label="ব্রেডক্রাম্ব">
          <Link href="/" className="hover:text-foreground">হোম</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/community" className="hover:text-foreground">কমিউনিটি</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-foreground">{formatted}</span>
        </nav>
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">কমিউনিটি প্রশ্ন</p>
          <h1 className="text-2xl font-bold font-heading">{formatted}</h1>
          <p className="text-muted-foreground">প্রশ্নের বিবরণ, ভেরিফাইড সার্ভেয়ার উত্তর, ভোটিং এবং মডারেশন প্লেসহোল্ডার এখানে থাকবে।</p>
        </div>
      </div>
    </PageWrapper>
  );
}
