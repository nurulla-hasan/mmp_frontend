import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Home,
  Landmark,
  Map,
  MessageSquare,
  Ruler,
  Save,
  Search,
  Shield,
  Star,
  Target,
  UserCheck,
  Users,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে — ডিজিটাল ভূমি পরিমাপ ও সার্ভেয়ার নেটওয়ার্ক",
  description:
    "Mouza Map Pro বাংলাদেশের জমি সংক্রান্ত জটিল কাজগুলোকে ডিজিটালাইজ করে সহজ ও স্বচ্ছ করার লক্ষ্যে তৈরি একটি ডিজিটাল ল্যান্ড সার্ভিস প্ল্যাটফর্ম।",
  keywords: [
    "আমাদের সম্পর্কে",
    "About Mouza Map Pro",
    "ডিজিটাল ভূমি পরিমাপ",
    "সার্ভেয়ার নেটওয়ার্ক বাংলাদেশ",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "আমাদের সম্পর্কে — ডিজিটাল ভূমি পরিমাপ ও সার্ভেয়ার নেটওয়ার্ক | Mouza Map Pro",
    description:
      "Mouza Map Pro বাংলাদেশের জমি সংক্রান্ত জটিল কাজগুলোকে ডিজিটালাইজ করে সহজ ও স্বচ্ছ করার লক্ষ্যে তৈরি একটি ডিজিটাল ল্যান্ড সার্ভিস প্ল্যাটফর্ম।",
    url: "/about",
  },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const features = [
  {
    icon: Ruler,
    title: "জমি পরিমাপ ক্যালকুলেটর",
    description:
      "বিভিন্ন পদ্ধতিতে জমির দৈর্ঘ্য, প্রস্থ ও মোট আয়তন নির্ধারণ করুন। Calculation সংরক্ষণ করে পরে আবার খুলে কাজ করুন।",
  },
  {
    icon: Search,
    title: "সার্ভেয়ার খোঁজা",
    description:
      "এলাকা, সেবা ও রেটিং অনুযায়ী যাচাইকৃত আমিন ও সার্ভেয়ার খুঁজুন এবং পেশাদার প্রোফাইল দেখুন।",
  },
  {
    icon: MessageSquare,
    title: "সরাসরি যোগাযোগ",
    description:
      "সার্ভেয়ারদের প্রোফাইল দেখে ১-ক্লিকে WhatsApp বা সরাসরি ফোনে যুক্ত হয়ে দ্রুত সেবা গ্রহণ করুন।",
  },
  {
    icon: Save,
    title: "হিসাব সংরক্ষণ",
    description:
      "ক্যালকুলেশন প্রজেক্ট আকারে সংরক্ষণ করুন, পরে এডিট বা কন্টিনিউ করুন। সব হিসাব এক জায়গায় রাখুন।",
  },
  {
    icon: Map,
    title: "মৌজা ম্যাপ সহায়তা",
    description:
      "মৌজা ম্যাপ বুঝতে, দাগ শনাক্ত করতে ও তথ্য যাচাই করতে প্রয়োজনীয় নির্দেশনা ও টুলস।",
  },
  {
    icon: BarChart3,
    title: "প্রফেশনাল রিপোর্ট",
    description:
      "পরিমাপের তথ্য সাজিয়ে একটি পরিষ্কার রিপোর্ট তৈরি করুন, PDF আকারে সংরক্ষণ ও শেয়ার করুন।",
  },
];

const stats = [
  { number: "৫০০+", label: "সক্রিয় সার্ভেয়ার" },
  { number: "১০০০+", label: "সফল পরিমাপ ও হিসাব" },
  { number: "৫০+", label: "জেলা জুড়ে সেবা" },
  { number: "৯৫%", label: "ব্যবহারকারী সন্তুষ্টি" },
];

const values = [
  {
    icon: Target,
    title: "আমাদের লক্ষ্য",
    description:
      "বাংলাদেশের জমি সংক্রান্ত কাজকে ডিজিটালাইজ করা এবং জমির মালিক ও পেশাজীবী সার্ভেয়ারদের মধ্যে একটি সেতুবন্ধন তৈরি করা।",
  },
  {
    icon: Star,
    title: "আমাদের মান",
    description:
      "নির্ভুলতা, স্বচ্ছতা ও বিশ্বস্ততা—আমাদের প্ল্যাটফর্মের মূল ভিত্তি। প্রতিটি সার্ভেয়ার যাচাইকরণ ও রেটিং সিস্টেমের মাধ্যমে মান নিশ্চিত করা হয়।",
  },
  {
    icon: Shield,
    title: "নিরাপত্তা ও গোপনীয়তা",
    description:
      "ব্যবহারকারীর তথ্য ও জমির নথি সর্বোচ্চ নিরাপত্তায় সংরক্ষণ করা হয়। ব্যক্তিগত তথ্য অন্যদের সঙ্গে শেয়ার না করার সুযোগ রাখা হয়েছে।",
  },
];

const howItWorks = [
  {
    step: "০১",
    title: "সার্ভেয়ার বা টুলস খুঁজুন",
    description:
      "আপনার জেলা অনুযায়ী ভেরিফাইড পেশাদার সার্ভেয়ার অথবা জমি পরিমাপের ডিজিটাল টুল নির্বাচন করুন।",
    icon: Search,
  },
  {
    step: "০২",
    title: "প্রোফাইল ও রিভিউ দেখুন",
    description:
      "সার্ভেয়ারের কাজের অভিজ্ঞতা, রেটিং, সেবা এবং ফি স্বচ্ছভাবে যাচাই করে নিশ্চিন্ত হোন।",
    icon: UserCheck,
  },
  {
    step: "০৩",
    title: "সরাসরি যোগাযোগ করুন",
    description:
      "WhatsApp বা সরাসরি ফোন কলের মাধ্যমে কথা বলে কাজের বিস্তারিত ও সময় নির্ধারণ করুন।",
    icon: MessageSquare,
  },
  {
    step: "০৪",
    title: "পরিমাপ ও ডিজিটাল রিপোর্ট",
    description:
      "সরেজমিনে নির্ভুল পরিমাপ ও প্রফেশনাল ডিজিটাল রিপোর্ট সংগ্রহের মাধ্যমে কাজ সম্পন্ন করুন।",
    icon: CheckCircle2,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <>
      {/* ─── Hero  */}
      <SectionWrapper padding="lg">
        <div className="relative mx-auto max-w-3xl text-center">
          {/* Background glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 size-90 -translate-x-1/2 -translate-y-20 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_70%)]" />
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Landmark className="size-8 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
            Mouza Map Pro
          </h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">
            বাংলাদেশের জমির হিসাব, যাচাইকৃত সার্ভেয়ার ও জরিপ সেবা—একটি আধুনিক
            ডিজিটাল প্ল্যাটফর্ম।
          </p>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Mouza Map Pro একটি ডিজিটাল ভূমি পরিমাপ ও জরিপ সেবা প্ল্যাটফর্ম। আমরা
            জমির মালিক, আমিন ও সার্ভেয়ারদের জন্য টুলস, ক্যালকুলেশন ও
            কানেক্টিভিটি সমাধান এনে দিচ্ছি।
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/surveyors" />}
            >
              সার্ভেয়ার খুঁজুন
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/join-as-surveyor" />}
            >
              সার্ভেয়ার হিসেবে যোগ দিন
            </Button>
          </div>
        </div>
      </SectionWrapper>

      {/* ─── Stats ────── */}
      <SectionWrapper padding="md" bg="muted">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="group text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl font-heading tracking-tight">
                {stat.number}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── Mission & Values ──── */}
      <SectionWrapper padding="lg">
        <SectionHeading
          title="আমাদের লক্ষ্য ও মূল্যবোধ"
          description="জমি সংক্রান্ত কাজকে সহজ, স্বচ্ছ ও ডিজিটাল করার প্রতিশ্রুতি।"
          alignment="center"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-2 hover:ring-primary/20"
              >
                <CardContent>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-base font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ─── Features / What We Offer ────*/}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          badge="আমরা যা অফার করি"
          title="এক প্ল্যাটফর্মে সব জরিপ সমাধান"
          description="জমি পরিমাপ থেকে সার্ভেয়ার খোঁজা, সবকিছু এক জায়গায়।"
          alignment="center"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border bg-card/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-2 hover:ring-primary/20 "
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-sm font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ─── How It Works ────*/}
      <SectionWrapper padding="lg">
        <SectionHeading
          badge="কীভাবে কাজ করে"
          title="চার ধাপে আপনার জমির কাজ এগিয়ে নিন"
          description="সহজ ও স্বচ্ছ প্রক্রিয়ায় আপনার কাঙ্ক্ষিত সার্ভে সেবা গ্রহণ করুন।"
          alignment="center"
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Top glowing accent line on hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary font-mono">
                      ধাপ {item.step}
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <h3 className="mt-5 font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Flow indicator on desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 items-center justify-center rounded-full border border-border bg-background shadow-xs text-muted-foreground text-xs font-bold">
                    &rarr;
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ─── For Whom ─── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          title="এটি কার জন্য?"
          description="জমির মালিক ও সার্ভেয়ার—দুই পক্ষের জন্যই Mouza Map Pro।"
          alignment="center"
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Landowner */}
          <Card className="border-emerald-500/25 bg-linear-to-b from-card to-emerald-500/5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/40">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <Home className="size-6" />
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                  জমির মালিক ও ক্রেতা
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium font-heading">জমির মালিকদের জন্য</h3>
              <ul className="mt-4 space-y-2.5">
                {[
                  "জমি পরিমাপ ও হিসাব সংরক্ষণ",
                  "সার্ভেয়ার খোঁজা ও প্রোফাইল দেখা",
                  "সরাসরি WhatsApp বা ফোনে যোগাযোগ",
                  "ভেরিফাইড ও রেটেড সার্ভেয়ার নির্বাচন",
                  "ডিজিটাল রিপোর্ট তৈরি ও প্রিন্ট",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                      <svg
                        className="size-2.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Surveyor */}
          <Card className="border-teal-500/25 bg-linear-to-b from-card to-teal-500/5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-500/40">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
                  <Briefcase className="size-6" />
                </div>
                <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-400">
                  পেশাদার সার্ভেয়ার ও আমিন
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium font-heading">সার্ভেয়ারদের জন্য</h3>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Professional Profile তৈরি",
                  "ভেরিফিকেশন ব্যাজ অর্জন",
                  "সরাসরি ক্লায়েন্ট কল ও WhatsApp যোগাযোগ",
                  "মার্কেটপ্লেসে নিজের সেবার প্রচার",
                  "ডিজিটাল টুলস ও ক্যালকুলেটর সুবিধা",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-400">
                      <svg
                        className="size-2.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      {/* ─── Why Mouza Map Pro ─── */}
      <SectionWrapper padding="lg">
        <SectionHeading
          badge="কেন Mouza Map Pro"
          title="আমরা কেন ভিন্ন?"
          alignment="center"
        />
        <div className="mx-auto mt-10 max-w-3xl space-y-6">
          {[
            {
              icon: BadgeCheck,
              title: "যাচাইকৃত সার্ভেয়ার",
              description:
                "প্রতিটি সার্ভেয়ার প্রোফাইল যাচাই করা হয়। আপনি শুধু বিশ্বস্ত পেশাজীবীদের সাথেই যুক্ত হন।",
            },
            {
              icon: BookOpen,
              title: "শিক্ষামূলক নির্দেশিকা",
              description:
                "জমি সংক্রান্ত জটিল বিষয় সহজ ভাষায় বোঝার জন্য গাইড ও টিউটোরিয়াল।",
            },
            {
              icon: Users,
              title: "কমিউনিটি ও রিভিউ সিস্টেম",
              description:
                "ব্যবহারকারীদের রিভিউ ও রেটিং দেখে সঠিক সার্ভেয়ার নির্বাচন করুন।",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-lg border bg-card/80 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20 "
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ─── Team / Commitment ──── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          badge="আমাদের টিম ও অঙ্গীকার"
          title="কারিগরি সক্ষমতা ও নিষ্ঠাবান টিম"
          description="ভূমি জরিপ ও আধুনিক সফটওয়্যার প্রযুক্তিতে অভিজ্ঞ একটি টিম আপনার সেবায়।"
          alignment="center"
        />
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Users className="size-8" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground font-heading">
                  Mouza Map Pro কারিগরি ও অপারেশনস টিম
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  দেশের মাঠপর্যায়ের পেশাদার সার্ভেয়ার, অভিজ্ঞ সফটওয়্যার ইঞ্জিনিয়ার ও বিশেষজ্ঞদের সমন্বয়ে আমরা কাজ করছি—যাতে মৌজা ম্যাপ ও জমি সংক্রান্ত হিসাব প্রতিটি নাগরিকের কাছে স্বচ্ছ ও সহজে পৌঁছায়।
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground justify-center sm:justify-start">
                <BadgeCheck className="size-4 text-primary shrink-0" />
                <span>যাচাইকৃত সার্ভেয়ার</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground justify-center sm:justify-start">
                <Shield className="size-4 text-primary shrink-0" />
                <span>তথ্য সুরক্ষা ও স্বচ্ছতা</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground justify-center sm:justify-start">
                <Target className="size-4 text-primary shrink-0" />
                <span>নির্ভুল ডিজিটাল হিসাব</span>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ─── Final CTA ── */}
      <SectionWrapper padding="lg" bg="primary">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 mx-auto size-80 rounded-full bg-primary/10 " />
          <SectionHeading
            as="h2"
            title="জমির কাজ শুরু করতে প্রস্তুত?"
            description="হিসাব করুন, পেশাদার সার্ভেয়ার খুঁজুন অথবা professional surveyor হিসেবে আপনার profile তৈরি করুন।"
            alignment="center"
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/surveyors" />}
            >
              সার্ভেয়ার খুঁজুন
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/join-as-surveyor" />}
            >
              সার্ভেয়ার হিসেবে যোগ দিন
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
