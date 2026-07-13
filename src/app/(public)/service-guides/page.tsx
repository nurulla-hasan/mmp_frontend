
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const services = [
  {
    emoji: "📏",
    title: "জমি পরিমাপ",
    description:
      "জমির দৈর্ঘ্য, প্রস্থ ও মোট আয়তন নির্ধারণ করার প্রয়োজন হলে এই সেবা নির্বাচন করুন।",
    when: [
      "জমির প্রকৃত পরিমাণ জানতে",
      "ক্রয় বা বিক্রয়ের আগে জমি যাচাই করতে",
      "দলিলের পরিমাণের সঙ্গে বাস্তব জমি মিলিয়ে দেখতে",
    ],
  },
  {
    emoji: "✂️",
    title: "জমি ভাগ-বাটোয়ারা",
    description:
      "একটি জমি একাধিক মালিক বা উত্তরাধিকারীর মধ্যে নির্ধারিত অংশ অনুযায়ী ভাগ করার জন্য এই সেবা নির্বাচন করুন।",
    when: [
      "পারিবারিক জমি ভাগ করতে",
      "উত্তরাধিকারীদের অংশ আলাদা করতে",
      "প্রতিটি অংশের পরিমাণ নির্ধারণ করতে",
    ],
  },
  {
    emoji: "📐",
    title: "সীমানা নির্ধারণ",
    description:
      "জমির সঠিক সীমানা বা চারপাশের সীমারেখা চিহ্নিত করার জন্য এই সেবা নির্বাচন করুন।",
    when: [
      "জমির সীমানা পরিষ্কার না হলে",
      "পাশের জমির সঙ্গে সীমানা নিয়ে বিভ্রান্তি থাকলে",
      "নির্মাণ বা বেড়া দেওয়ার আগে",
    ],
  },
  {
    emoji: "🛰️",
    title: "ডিজিটাল সার্ভে",
    description:
      "আধুনিক যন্ত্রপাতি ব্যবহার করে জমির অবস্থান, পরিমাপ ও প্রয়োজনীয় তথ্য সংগ্রহের জন্য এই সেবা নির্বাচন করুন।",
    when: [
      "নির্ভুলভাবে জমি পরিমাপ করতে",
      "বড় বা জটিল আকৃতির জমি সার্ভে করতে",
      "ডিজিটাল তথ্য বা নকশা প্রয়োজন হলে",
    ],
  },
  {
    emoji: "🗺️",
    title: "মৌজা ম্যাপ সহায়তা",
    description:
      "মৌজা ম্যাপ বুঝতে, নির্দিষ্ট দাগ শনাক্ত করতে অথবা ম্যাপের তথ্যের সঙ্গে জমির অবস্থান মিলিয়ে দেখতে এই সেবা নির্বাচন করুন।",
    when: [
      "মৌজা ম্যাপে নিজের দাগ খুঁজতে",
      "ম্যাপের চিহ্ন ও পরিমাপ বুঝতে",
      "জমির অবস্থান যাচাই করতে",
    ],
  },
  {
    emoji: "📄",
    title: "পরিমাপ রিপোর্ট",
    description:
      "জমি পরিমাপের তথ্য সাজিয়ে একটি পরিষ্কার রিপোর্ট প্রয়োজন হলে এই সেবা নির্বাচন করুন।",
    when: [
      "জমির পরিমাণ ও পরিমাপ সংরক্ষণ করতে",
      "পরিবারের সদস্য বা সংশ্লিষ্ট ব্যক্তির সঙ্গে তথ্য শেয়ার করতে",
      "Print বা PDF Report প্রয়োজন হলে",
    ],
  },
];

const guideList = [
  { condition: "শুধু জমির পরিমাণ জানতে চাইলে", service: "জমি পরিমাপ" },
  { condition: "অংশ অনুযায়ী জমি ভাগ করতে চাইলে", service: "জমি ভাগ-বাটোয়ারা" },
  { condition: "জমির সীমারেখা চিহ্নিত করতে চাইলে", service: "সীমানা নির্ধারণ" },
  { condition: "আধুনিক পদ্ধতিতে নির্ভুল সার্ভে চাইলে", service: "ডিজিটাল সার্ভে" },
  { condition: "মৌজা ম্যাপ বা দাগ বুঝতে সহায়তা চাইলে", service: "মৌজা ম্যাপ সহায়তা" },
  { condition: "পরিমাপের লিখিত বা PDF ফলাফল চাইলে", service: "পরিমাপ রিপোর্ট" },
];

const preparationList = [
  "জমি যে জেলা ও উপজেলায় অবস্থিত",
  "জমির আনুমানিক পরিমাণ",
  "কী ধরনের কাজ প্রয়োজন",
  "কাজটি করার সম্ভাব্য তারিখ",
  "সমস্যার সংক্ষিপ্ত কিন্তু পরিষ্কার বিবরণ",
];

const steps = [
  {
    step: "১",
    title: "Service Request পোস্ট করুন",
    description:
      "প্রয়োজনীয় সেবা, জমির অবস্থান এবং কাজের বিবরণ দিয়ে Request প্রকাশ করুন।",
  },
  {
    step: "২",
    title: "Quotation গ্রহণ করুন",
    description:
      "সার্ভেয়াররা আপনার কাজের বিস্তারিত দেখে মূল্য ও প্রয়োজনীয় তথ্যসহ Quotation পাঠাবেন।",
  },
  {
    step: "৩",
    title: "সার্ভেয়ার নির্বাচন করুন",
    description:
      "প্রাপ্ত Quotation তুলনা করে আপনার জন্য উপযুক্ত সার্ভেয়ার নির্বাচন করুন।",
  },
  {
    step: "৪",
    title: "কাজ সম্পন্ন করুন",
    description:
      "Messages-এর মাধ্যমে বিস্তারিত আলোচনা করে সময় নির্ধারণ করুন এবং Request status track করুন।",
  },
];

const importantInfo = [
  "সার্ভেয়ার নির্বাচন করার আগে তার Professional Profile দেখুন।",
  "Experience, Services, Service Areas এবং Reviews যাচাই করুন।",
  "Quotation-এর কাজের পরিধি ও মূল্য ভালোভাবে বুঝে নিন।",
  "সম্পূর্ণ ঠিকানা বা ব্যক্তিগত জমির তথ্য public description-এ প্রকাশ করবেন না।",
  "প্রয়োজনীয় বিস্তারিত নির্বাচিত সার্ভেয়ারের সঙ্গে Messages-এ আলোচনা করুন।",
];

const faqs = [
  {
    q: "ভুল Service Category নির্বাচন করলে কী হবে?",
    a: "Request প্রকাশের আগে সঠিক category নির্বাচন করার চেষ্টা করুন। প্রয়োজন হলে Request edit বা cancel করে নতুন Request পোস্ট করা যাবে।",
  },
  {
    q: "এক Request-এ একাধিক সেবা দেওয়া যাবে?",
    a: "একটি Request-এ প্রধান একটি Service Category নির্বাচন করুন। অতিরিক্ত প্রয়োজন কাজের বিবরণে উল্লেখ করতে পারবেন।",
  },
  {
    q: "Quotation-এর মূল্য কি final?",
    a: "Quotation-এর শর্ত অনুযায়ী মূল্য নির্ধারিত হবে। কাজের পরিধি পরিবর্তিত হলে সার্ভেয়ারের সঙ্গে আলোচনা প্রয়োজন হতে পারে।",
  },
  {
    q: "Request পোস্ট করার পর কী হবে?",
    a: "আপনার Request available হলে উপযুক্ত সার্ভেয়াররা সেটি দেখে Quotation পাঠাতে পারবেন।",
  },
  {
    q: "নির্দিষ্ট সার্ভেয়ার বেছে নিতে পারব?",
    a: "প্রাপ্ত Quotation এবং সার্ভেয়ারের Professional Profile দেখে আপনার পছন্দের সার্ভেয়ার নির্বাচন করতে পারবেন।",
  },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent className="px-5 py-1">
          {faqs.map((faq, i) => (
            <Collapsible
              key={i}
              open={openIndex === i}
              onOpenChange={() => setOpenIndex(openIndex === i ? null : i)}
              className="border-b last:border-b-0"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-primary">
                {faq.q}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === i && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pb-4 text-sm leading-6 text-muted-foreground">
                {faq.a}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ServiceGuidesPage() {
  return (
    <>
      {/* ─── 1. Hero ─────────────────────────────────────────── */}
      <SectionWrapper padding="lg">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            as="h1"
            alignment="center"
            title="আপনার প্রয়োজন অনুযায়ী সঠিক জমির সেবা নির্বাচন করুন"
            description="জমি পরিমাপ, সীমানা নির্ধারণ কিংবা মৌজা ম্যাপ বুঝতে সহায়তা—কোন কাজের জন্য কোন সেবা প্রয়োজন, এখানে সহজভাবে জেনে নিন।"
          />
          <p className="mt-6 rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            প্রয়োজনে একজন অভিজ্ঞ আমিন/সার্ভেয়ার আপনার কাজের বিস্তারিত দেখে উপযুক্ত
            Quotation পাঠাবেন।
          </p>
        </div>
      </SectionWrapper>

      {/* ─── 2. Service Categories ──────────────────────────── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          title="সেবা সমূহ"
          description="নিচের ছয়টি সেবার মধ্যে আপনার প্রয়োজন অনুযায়ী সঠিকটি বেছে নিন।"
          alignment="center"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Card
              key={svc.title}
              className="transition-all hover:-translate-y-0.5 hover:shadow-sm"
            >
              <CardContent className="p-6">
                <span className="text-2xl">{svc.emoji}</span>
                <h3 className="mt-3 text-base font-medium">{svc.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {svc.description}
                </p>
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-medium text-primary">
                    কখন প্রয়োজন হতে পারে:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs leading-5 text-muted-foreground">
                    {svc.when.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── 3. Which Service to Choose ─────────────────────── */}
      <SectionWrapper padding="lg">
        <SectionHeading
          title="কোন সেবাটি নির্বাচন করবেন?"
          description="আপনার প্রয়োজন অনুযায়ী নিচের নির্দেশনা অনুসরণ করুন:"
          alignment="center"
        />
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          {guideList.map((item) => (
            <div
              key={item.service}
              className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm"
            >
              <span className="mt-0.5 shrink-0 text-primary">✓</span>
              <span>
                <span className="text-muted-foreground">{item.condition}</span>{" "}
                —{" "}
                <span className="font-medium text-foreground">
                  {item.service}
                </span>
              </span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── 4. Before Posting ──────────────────────────────── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          title="Request পোস্ট করার আগে যা প্রস্তুত রাখবেন"
          description="সার্ভেয়ারকে আপনার প্রয়োজন বুঝতে সহায়তা করার জন্য নিচের তথ্যগুলো প্রস্তুত রাখুন:"
          alignment="center"
        />
        <div className="mx-auto mt-8 max-w-2xl">
          <ul className="space-y-3">
            {preparationList.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-6"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      {/* ─── 5. How It Works ────────────────────────────────── */}
      <SectionWrapper padding="lg">
        <SectionHeading
          badge="কীভাবে কাজ করে"
          title="চার ধাপে আপনার কাজ সম্পন্ন করুন"
          alignment="center"
        />
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {steps.map((item, i) => (
            <div key={item.step} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-6 hidden h-0.5 w-[calc(100%-48px)] bg-border md:block" />
              )}
              <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className="relative shrink-0">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">
                      {item.step}
                    </span>
                  </div>
                </div>
                <div className="md:mt-4">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── 6. Pricing ─────────────────────────────────────── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          title="মূল্য কীভাবে নির্ধারিত হবে?"
          description="সেবার মূল্য নির্দিষ্ট নয়। জমির অবস্থান, পরিমাণ, কাজের ধরন এবং প্রয়োজনীয় সময় অনুযায়ী সার্ভেয়ার Quotation প্রদান করবেন।"
          alignment="center"
        />
        <p className="mt-6 text-center text-sm leading-6 text-muted-foreground">
          Request পোস্ট করার জন্য আগে থেকে কোনো নির্দিষ্ট মূল্য লিখতে হবে না।
        </p>
      </SectionWrapper>

      {/* ─── 7. Important Info ──────────────────────────────── */}
      <SectionWrapper padding="lg">
        <SectionHeading
          badge="গুরুত্বপূর্ণ তথ্য"
          title="নিরাপদ ও স্মার্ট ব্যবহারের জন্য"
          alignment="center"
        />
        <div className="mx-auto mt-8 max-w-2xl">
          <ul className="space-y-3">
            {importantInfo.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm leading-6"
              >
                <span className="mt-0.5 shrink-0 text-primary">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      {/* ─── 8. FAQ ─────────────────────────────────────────── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          badge="FAQ"
          title="সচরাচর জিজ্ঞাসা"
          alignment="center"
        />
        <div className="mt-8">
          <FaqAccordion />
        </div>
      </SectionWrapper>

      {/* ─── 9. Final CTA ───────────────────────────────────── */}
      <SectionWrapper padding="lg" bg="primary">
        <SectionHeading
          as="h2"
          title="কোন সেবাটি প্রয়োজন বুঝতে পেরেছেন?"
          description="আপনার জমির কাজের তথ্য দিয়ে একটি Service Request পোস্ট করুন এবং সার্ভেয়ারদের কাছ থেকে Quotation গ্রহণ করুন।"
          alignment="center"
        />
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/post-request" />}
          >
            Service Request পোস্ট করুন
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/surveyors" />}
          >
            সার্ভেয়ার খুঁজুন
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
