import type { Metadata } from "next";
import Link from "next/link";
import { PageWrapper } from "@/components/common/page-wrapper";

function formatRouteValue(value: string) {
  return decodeURIComponent(value).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = formatRouteValue(slug);

  return {
    title: `${title} — কমিউনিটি প্রশ্নোত্তর`,
    description: `${title} সংক্রান্ত আলোচনা, বিশেষজ্ঞ সার্ভেয়ারদের সমাধান ও পরামর্শ।`,
    alternates: {
      canonical: `/community/questions/${slug}`,
    },
    openGraph: {
      title: `${title} — কমিউনিটি প্রশ্নোত্তর | Mouza Map Pro`,
      description: `${title} সংক্রান্ত আলোচনা, বিশেষজ্ঞ সার্ভেয়ারদের সমাধান ও পরামর্শ।`,
      url: `/community/questions/${slug}`,
    },
  };
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
          <p className="text-muted-foreground">প্রশ্নের বিবরণ, ভেরিফাইড সার্ভেয়ার উত্তর, ভোটিং এবং আলোচনা।</p>
        </div>
      </div>
    </PageWrapper>
  );
}
