import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { ArrowRight } from "lucide-react";

interface DashboardCard {
  label: string;
  value?: string;
  href?: string;
  description?: string;
}

interface DashboardPageProps {
  title: string;
  description: string;
  cards?: DashboardCard[];
  showBack?: boolean;
}

export function DashboardPage({ title, description, cards = [] }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <SectionHeading title={title} description={description} alignment="left" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const content = (
            <>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {card.value && <p className="mt-2 text-2xl font-semibold">{card.value}</p>}
              {card.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>}
              {card.href && <ArrowRight className="mt-4 size-4 text-muted-foreground" aria-hidden="true" />}
            </>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent/50">
              {content}
            </Link>
          ) : (
            <div key={card.label} className="rounded-xl border bg-card p-5">{content}</div>
          );
        })}
      </div>
      {cards.length === 0 && (
        <div className="rounded-xl border border-dashed bg-card p-8 text-center">
          <p className="font-medium">ওয়ার্কস্পেস প্রস্তুত</p>
          <p className="mt-2 text-sm text-muted-foreground">ফিচার কন্টেন্ট এবং ব্যাকএন্ড ডেটা পরবর্তী পর্যায়ে সংযুক্ত করা হবে।</p>
        </div>
      )}
    </div>
  );
}
