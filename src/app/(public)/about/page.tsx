import Link from "next/link";
import {
 BadgeCheck,
 BarChart3,
 BookOpen,
 Briefcase,
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
 Users,
} from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
 title: "সার্ভিস রিকোয়েস্ট",
 description:
 "জমির কাজের তথ্য দিয়ে রিকোয়েস্ট পোস্ট করুন এবং একাধিক সার্ভেয়ারের কাছ থেকে কোটেশন গ্রহণ করুন।",
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
 { number: "১০০০+", label: "সার্ভিস রিকোয়েস্ট" },
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
 step: "১",
 title: "প্রয়োজন জানান",
 description:
 "সেবা, জমির অবস্থান ও প্রয়োজনীয় তথ্য দিয়ে রিকোয়েস্ট তৈরি করুন।",
 },
 {
 step: "২",
 title: "কোটেশন গ্রহণ করুন",
 description:
 "আপনার এলাকার সার্ভেয়ারদের প্রস্তাব ও আনুমানিক খরচ দেখুন।",
 },
 {
 step: "৩",
 title: "সার্ভেয়ার নির্বাচন করুন",
 description:
 "অভিজ্ঞতা, ভেরিফিকেশন এবং কোটেশন তুলনা করে সঠিক পেশাজীবী নির্বাচন করুন।",
 },
 {
 step: "৪",
 title: "কাজ সম্পন্ন করুন",
 description:
 "মেসেজ-এর মাধ্যমে বিস্তারিত আলোচনা করে সময় নির্ধারণ করুন এবং রিকোয়েস্ট স্ট্যাটাস ট্র্যাক করুন।",
 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
 return (
 <>
 {/* ─── Hero ──────────────────────────────────────────── */}
 <SectionWrapper padding="lg">
 <div className="relative mx-auto max-w-3xl text-center">
  {/* Background glow */}
  <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-20 rounded-full bg-primary/10 blur-[100px]" />
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
 Mouza Map Pro একটি ডিজিটাল ভূমি পরিমাপ ও জরিপ সেবা প্ল্যাটফর্ম।
 আমরা জমির মালিক, আমিন ও সার্ভেয়ারদের জন্য টুলস, ক্যালকুলেশন ও
 কানেক্টিভিটি সমাধান এনে দিচ্ছি।
 </p>
 <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Button
 size="lg"
 nativeButton={false}
 render={<Link href="/post-request" />}
 >
 কাজ পোস্ট করুন
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
 </div>
 </SectionWrapper>

 {/* ─── Stats ─────────────────────────────────────────── */}
 <SectionWrapper padding="md" bg="muted">
 <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
 {stats.map((stat) => (
 <div key={stat.label} className="group text-center">
 <p className="text-3xl font-bold text-primary sm:text-4xl" style={{ textShadow: "0 0 12px color-mix(in oklch, var(--primary) 40%, transparent)" }}>
 {stat.number}
 </p>
 <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
 </div>
 ))}
 </div>
 </SectionWrapper>

 {/* ─── Mission & Values ──────────────────────────────── */}
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

 {/* ─── Features / What We Offer ──────────────────────── */}
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

 {/* ─── How It Works ──────────────────────────────────── */}
 <SectionWrapper padding="lg">
 <SectionHeading
 badge="কীভাবে কাজ করে"
 title="চার ধাপে আপনার জমির কাজ এগিয়ে নিন"
 alignment="center"
 />
 <div className="mt-10 grid gap-8 md:grid-cols-4">
 {howItWorks.map((item, i) => (
 <div key={item.step} className="relative">
 {i < howItWorks.length - 1 && (
 <div className="absolute left-6 top-6 hidden h-0.5 w-[calc(100%-48px)] bg-border md:block" />
 )}
 <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
 <div className="relative shrink-0">
 <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/20">
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

 {/* ─── For Whom ──────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <SectionHeading
 title="এটি কার জন্য?"
 description="জমির মালিক ও সার্ভেয়ার—দুই পক্ষের জন্যই Mouza Map Pro।"
 alignment="center"
 />
 <div className="mt-8 grid gap-6 md:grid-cols-2">
 {/* Landowner */}
 <Card className="border-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-2 hover:ring-primary/20">
 <CardContent>
 <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <Home className="size-6" />
 </div>
 <h3 className="mt-4 text-lg font-medium">জমির মালিকদের জন্য</h3>
 <ul className="mt-4 space-y-2.5">
 {[
 "জমি পরিমাপ ও হিসাব সংরক্ষণ",
 "সার্ভেয়ার খোঁজা ও প্রোফাইল দেখা",
 "Service Request পোস্ট করা",
 "কোটেশন তুলনা ও নির্বাচন",
 "কাজের অগ্রগতি ট্র্যাক করা",
 ].map((b) => (
 <li
 key={b}
 className="flex items-start gap-2 text-sm text-muted-foreground"
 >
 <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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
 <Card className="border-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-2 hover:ring-primary/20">
 <CardContent>
 <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <Briefcase className="size-6" />
 </div>
 <h3 className="mt-4 text-lg font-medium">সার্ভেয়ারদের জন্য</h3>
 <ul className="mt-4 space-y-2.5">
 {[
 "Professional Profile তৈরি",
 "ভেরিফিকেশন ব্যাজ অর্জন",
 "Available Request দেখা",
 "কোটেশন পাঠানো",
 "ক্লায়েন্টের সাথে সরাসরি যোগাযোগ",
 ].map((b) => (
 <li
 key={b}
 className="flex items-start gap-2 text-sm text-muted-foreground"
 >
 <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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

 {/* ─── Why Mouza Map Pro ─────────────────────────────── */}
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

 {/* ─── Team ──────────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <SectionHeading
 title="আমাদের টিম"
 description="ভূমি জরিপ ও প্রযুক্তিতে অভিজ্ঞ একটি টিম আপনার সেবায়।"
 alignment="center"
 />
 <div className="mx-auto mt-10 max-w-xl">
 <Card className="text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-2 hover:ring-primary/20">
 <CardContent>
 <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
 <Users className="size-8 text-primary" />
 </div>
 <h3 className="mt-4 text-lg font-medium">Mouza Map Pro টিম</h3>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 ভূমি জরিপ, সফটওয়্যার ডেভেলপমেন্ট ও গ্রাহক সেবায় অভিজ্ঞ একটি
 টিম দেশের জমি সংক্রান্ত কাজকে সহজ ও ডিজিটাল করার লক্ষ্যে কাজ
 করছে।
 </p>
 </CardContent>
 </Card>
 </div>
 </SectionWrapper>

 {/* ─── Final CTA ─────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="primary">
 <div className="relative">
 <div className="pointer-events-none absolute inset-0 mx-auto size-80 rounded-full bg-primary/10 " />
 <SectionHeading
 as="h2"
 title="জমির কাজ শুরু করতে প্রস্তুত?"
 description="হিসাব করুন, প্রয়োজন পোস্ট করুন অথবা professional surveyor হিসেবে আপনার profile তৈরি করুন।"
 alignment="center"
 />
 <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Button
 size="lg"
 nativeButton={false}
 render={<Link href="/post-request" />}
 >
 কাজ পোস্ট করুন
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
