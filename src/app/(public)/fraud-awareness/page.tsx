"use client";

import { useState } from "react";
import Link from "next/link";
import {
 AlertTriangle,
 Ban,
 BookOpen,
 ChevronDown,
 FileSearch,
 Fingerprint,
 Landmark,
 Phone,
 Scale,
 Search,
 Shield,
 ShieldAlert,
 Siren,
 UserCheck,
 Users,
} from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
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

const fraudTypes = [
 {
 icon: FileSearch,
 title: "ভুয়া দলিল ও নকল নথি",
 description:
 "প্রতারকরা ভুয়া দলিল, জাল খতিয়ান বা মিউটেশন সনদ দেখিয়ে জমি দখল বা বিক্রির চেষ্টা করে। সঠিক কাগজপত্র যাচাই না করে লেনদেন করবেন না।",
 warning: "দলিল ও খতিয়ান সরাসরি ভূমি অফিস থেকে যাচাই করুন।",
 },
 {
 icon: UserCheck,
 title: "ভুয়া আমিন/সার্ভেয়ার প্রতারণা",
 description:
 "কেউ নিজেকে আমিন বা সার্ভেয়ার পরিচয় দিয়ে অগ্রিম পেমেন্ট নিয়ে গায়েব হয়ে যেতে পারে। প্ল্যাটফর্মের বাইরে অবিশ্বস্ত কারও সাথে লেনদেন করবেন না।",
 warning: "শুধু যাচাইকৃত সার্ভেয়ারদের সাথেই কাজ করুন।",
 },
 {
 icon: Scale,
 title: "ওজন ও পরিমাপে কারচুপি",
 description:
 "জমি পরিমাপের সময় ভুল বা কারচুপির মাধ্যমে প্রকৃত আয়তন কমিয়ে বা বাড়িয়ে দেখানো হতে পারে। নির্ভুল যন্ত্রপাতি ও সঠিক পদ্ধতি নিশ্চিত করুন।",
 warning: "একাধিকবার পরিমাপ করিয়ে নিশ্চিত হন।",
 },
 {
 icon: ShieldAlert,
 title: "অগ্রিম পেমেন্ট জালিয়াতি",
 description:
 "কাজ শুরু করার আগে অগ্রিম টাকা দাবি করে পরে কাজ না করা বা নিম্নমানের কাজ দেওয়া একটি সাধারণ প্রতারণা।",
 warning: "কাজ শেষ না হওয়া পর্যন্ত বড় অঙ্কের পেমেন্ট দেওয়া থেকে বিরত থাকুন।",
 },
 {
 icon: Ban,
 title: "জমি দ্বৈত বিক্রয়",
 description:
 "একই জমি একাধিক ব্যক্তির কাছে বিক্রি করার ঘটনা দেশের বিভিন্ন স্থানে ঘটে। সঠিক দলিল ও খতিয়ান যাচাই না করে কেনাকাটা করবেন না।",
 warning: "ভূমি অফিস থেকে দলিল ও খতিয়ানের সর্বশেষ অবস্থা দেখে নিন।",
 },
 {
 icon: Siren,
 title: "সরকারি কর্মচারী সেজে প্রতারণা",
 description:
 "প্রতারকরা ভূমি অফিসের কর্মচারী বা সরকারি কর্মকর্তা সেজে অতিরিক্ত ফি দাবি করে। সরকারি কোনো ফি অনলাইনে বা অফিসে পরিশোধ করুন।",
 warning: "সরকারি কর্মকর্তা পরিচয়ে কেউ ফি চাইলে ভেরিফাই করে নিন।",
 },
];

const safetyTips = [
 {
 icon: Search,
 title: "নথি যাচাই করুন",
 description:
 "দলিল, খতিয়ান, মিউটেশন, কর ও ম্যাপের তথ্য মিলিয়ে দেখুন। কোনো অসঙ্গতি থাকলে ভূমি অফিস থেকে নিশ্চিত হন।",
 },
 {
 icon: Fingerprint,
 title: "পরিচয় নিশ্চিত করুন",
 description:
 "সার্ভেয়ার বা ক্রেতা/বিক্রেতার জাতীয় পরিচয়পত্র ও পেশাগত তথ্য যাচাই করুন। প্ল্যাটফর্মের ভেরিফিকেশন ব্যাজ দেখুন।",
 },
 {
 icon: Shield,
 title: "প্ল্যাটফর্মের বাইরে লেনদেন এড়িয়ে চলুন",
 description:
 "আমাদের প্ল্যাটফর্মের বাইরে অগ্রিম পেমেন্ট বা ব্যক্তিগত তথ্য শেয়ার করা থেকে বিরত থাকুন। সব লেনদেন ও যোগাযোগ প্ল্যাটফর্মের মাধ্যমেই রাখুন।",
 },
 {
 icon: BookOpen,
 title: "সরকারি পোর্টাল ব্যবহার করুন",
 description:
 "ভূমি সংক্রান্ত তথ্য ও নথি যাচাইয়ের জন্য ভূমি মন্ত্রণালয়ের পোর্টাল (land.gov.bd) ও ই-মিউটেশন সিস্টেম ব্যবহার করুন।",
 },
];

const emergencyContacts = [
 {
 icon: Phone,
 label: "সাইবার ক্রাইম হেল্পলাইন",
 value: "০১৭৬৯-৬৭৪৮৮০",
 detail: "সাইবার প্রতারণা সংক্রান্ত অভিযোগ",
 },
 {
 icon: Siren,
 label: "জাতীয় জরুরি সেবা",
 value: "৯৯৯",
 detail: "যেকোনো জরুরি সাহায্যের জন্য",
 },
 {
 icon: Landmark,
 label: "স্থানীয় ভূমি অফিস",
 value: "নিজ জেলা/উপজেলা ভূমি অফিস",
 detail: "দলিল ও খতিয়ান যাচাইয়ের জন্য",
 },
 {
 icon: Users,
 label: "পুলিশ হেল্পলাইন",
 value: "০১৩২০-০০০০০০",
 detail: "প্রতারণা সংক্রান্ত অভিযোগ জানাতে",
 },
];

const faqs = [
 {
 q: "ভুয়া দলিল চেনার উপায় কী?",
 a: "দলিলের নিবন্ধন নম্বর, তারিখ ও সাব-রেজিস্ট্রার অফিসের তথ্য যাচাই করুন। ভূমি অফিসে গিয়ে মূল দলিল ও খতিয়ানের সাথে মিলিয়ে দেখুন। ই-মিউটেশন সিস্টেমের মাধ্যমেও যাচাই করতে পারেন।",
 },
 {
 q: "সার্ভেয়ার বিশ্বস্ত কিনা বুঝব কীভাবে?",
 a: "আমাদের প্ল্যাটফর্মের যাচাইকৃত সার্ভেয়ারদের প্রোফাইলে ভেরিফিকেশন ব্যাজ, রেটিং ও রিভিউ দেখুন। প্ল্যাটফর্মের বাইরে অবিশ্বস্ত কারও সাথে লেনদেন না করাই ভালো।",
 },
 {
 q: "প্রতারণার শিকার হলে কী করব?",
 a: "প্রথমে স্থানীয় পুলিশ স্টেশনে অভিযোগ দায়ের করুন। পাশাপাশি সাইবার ক্রাইম হেল্পলাইনে যোগাযোগ করুন। জমি সংক্রান্ত হলে ভূমি অফিসে অবহিত করুন। প্রয়োজনীয় সব নথি ও প্রমাণ সংরক্ষণ করুন।",
 },
 {
 q: "অনলাইনে জমি কেনার সময় কী কী সতর্কতা নেব?",
 a: "দলিল ও খতিয়ানের বৈধতা যাচাই করুন, একাধিকবার জমি দেখে নিন, জমির সীমানা নিশ্চিত করুন, এবং সরাসরি ভূমি অফিস থেকে তথ্য যাচাই করুন। বড় অঙ্কের টাকা লেনদেনের আগে আইনজীবীর পরামর্শ নিন।",
 },
 {
 q: "Mouza Map Pro কীভাবে আমার তথ্য সুরক্ষিত রাখে?",
 a: "আমরা সর্বোচ্চ নিরাপত্তা প্রযুক্তি ব্যবহার করি। আপনার ব্যক্তিগত তথ্য ও জমির নথি এনক্রিপ্টেড আকারে সংরক্ষণ করা হয়। পাবলিক পোস্টে সম্পূর্ণ ঠিকানা বা ব্যক্তিগত তথ্য প্রকাশ করতে বারণ করা হয়।",
 },
];

const steps = [
 {
 step: "১",
 title: "থেমে যান",
 description:
 "যদি কোনো অফার বা প্রস্তাব অস্বাভাবিক মনে হয়, তবে দ্রুত সিদ্ধান্ত নেবেন না। প্রতারকরা জরুরি অনুভূতি তৈরি করার চেষ্টা করে।",
 },
 {
 step: "২",
 title: "যাচাই করুন",
 description:
 "ব্যক্তি, নথি ও তথ্য যাচাই করুন। ভূমি অফিস, পুলিশ বা নির্ভরযোগ্য সূত্র থেকে নিশ্চিত হন। আমাদের প্ল্যাটফর্মের মাধ্যমে সার্ভেয়ার যাচাই করুন।",
 },
 {
 step: "৩",
 title: "সংরক্ষণ করুন",
 description:
 "সব নথি, রশিদ, স্ক্রিনশট ও কথোপকথনের প্রমাণ সংরক্ষণ করুন। প্রয়োজনে আইনি পদক্ষেপ নিতে এগুলো কাজে লাগবে।",
 },
 {
 step: "৪",
 title: "রিপোর্ট করুন",
 description:
 "প্রতারণার শিকার হলে বা সন্দেহ হলে সংশ্লিষ্ট কর্তৃপক্ষকে জানান। অন্যদের সতর্ক করতে কমিউনিটিতে শেয়ার করুন।",
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
 <CardContent>
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

export default function FraudAwarenessPage() {
 return (
 <>
 {/* ─── Hero ──────────────────────────────────────────── */}
 <SectionWrapper padding="lg">
 <div className="relative mx-auto max-w-3xl text-center">
  <div className="pointer-events-none absolute top-0 left-1/2 -z-10 size-90 -translate-x-1/2 -translate-y-20 rounded-full bg-destructive/10 blur-[100px]" />
 <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 shadow-lg shadow-destructive/10">
 <ShieldAlert className="size-8 text-destructive" />
 </div>
 <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
 প্রতারণা সতর্কতা
 </h1>
 <p className="mt-4 text-lg leading-7 text-muted-foreground">
 জমি সংক্রান্ত প্রতারণা থেকে বাঁচতে সচেতন হোন। সঠিক জ্ঞান ও সতর্কতা
 আপনার অর্থ ও জমি রক্ষা করতে পারে।
 </p>
 <p className="mt-4 rounded-lg bg-destructive/5 p-4 text-sm leading-6 text-muted-foreground">
 এই কন্টেন্ট শুধুমাত্র সচেতনতা মূলক। জমি সংক্রান্ত যেকোনো আইনি
 সিদ্ধান্তের আগে সংশ্লিষ্ট কর্তৃপক্ষ ও আইনজীবীর পরামর্শ নিন।
 </p>
 </div>
 </SectionWrapper>

 {/* ─── Common Fraud Types ────────────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <SectionHeading
 badge="প্রচলিত প্রতারণা"
 title="জমি সংক্রান্ত সাধারণ প্রতারণার ধরণ"
 description="নিচের প্রতারণাগুলো সম্পর্কে সচেতন থাকুন এবং প্রয়োজনীয় সতর্কতা নিন।"
 alignment="center"
 />
 <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {fraudTypes.map((item) => {
 const Icon = item.icon;
 return (
 <Card
 key={item.title}
 className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-destructive/5 hover:ring-2 hover:ring-destructive/20"
 >
 <CardContent>
 <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
 <Icon className="size-6" />
 </div>
 <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 {item.description}
 </p>
 <div className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/5 p-3 text-xs leading-5 text-destructive">
 <AlertTriangle className="mt-0.5 size-3 shrink-0" />
 <span>{item.warning}</span>
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </SectionWrapper>

 {/* ─── Safety Steps ──────────────────────────────────── */}
 <SectionWrapper padding="lg">
 <SectionHeading
 title="প্রতারণা থেকে বাঁচার ৪টি ধাপ"
 description="যে কোনো জমি সংক্রান্ত লেনদেনের আগে এই ধাপগুলো অনুসরণ করুন।"
 alignment="center"
 />
 <div className="mt-10 grid gap-8 md:grid-cols-4">
 {steps.map((item, i) => (
 <div key={item.step} className="relative">
 {i < steps.length - 1 && (
 <div className="absolute left-6 top-6 hidden h-0.5 w-[calc(100%-48px)] bg-destructive/20 md:block" />
 )}
 <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
 <div className="relative shrink-0">
 <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 shadow-lg shadow-destructive/10 ring-2 ring-destructive/20">
 <span className="text-lg font-bold text-destructive">
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

 {/* ─── Safety Tips ───────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <SectionHeading
 badge="নিরাপদ থাকুন"
 title="নিরাপত্তা টিপস"
 description="নিজেকে রক্ষা করতে এই টিপসগুলো মেনে চলুন।"
 alignment="center"
 />
 <div className="mx-auto mt-10 max-w-3xl space-y-6">
 {safetyTips.map((item) => {
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

 {/* ─── Emergency Contacts ────────────────────────────── */}
 <SectionWrapper padding="lg">
 <SectionHeading
 badge="গুরুত্বপূর্ণ যোগাযোগ"
 title="প্রয়োজনে যোগাযোগ করুন"
 description="প্রতারণার শিকার হলে নিচের নম্বরগুলোতে যোগাযোগ করুন।"
 alignment="center"
 />
 <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
 {emergencyContacts.map((item) => {
 const Icon = item.icon;
 return (
 <div
 key={item.label}
 className="flex items-start gap-4 rounded-lg border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-destructive/5 hover:ring-1 hover:ring-destructive/20"
 >
 <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
 <Icon className="size-5" />
 </div>
 <div>
 <p className="text-sm font-medium">{item.label}</p>
 <p className="mt-0.5 text-sm font-semibold text-foreground">
 {item.value}
 </p>
 <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
 {item.detail}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </SectionWrapper>

 {/* ─── FAQ ───────────────────────────────────────────── */}
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

 {/* ─── Final CTA ─────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="primary">
 <div className="relative">
 <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-10 rounded-full bg-primary/20 blur-[80px]" />
 <SectionHeading
 as="h2"
 title="নিরাপদে জমির কাজ শুরু করুন"
 description="যাচাইকৃত সার্ভেয়ার খুঁজুন, প্রয়োজন পোস্ট করুন এবং নির্ভয়ে জমির কাজ এগিয়ে নিন।"
 alignment="center"
 />
 <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Button
 size="lg"
 nativeButton={false}
 render={<Link href="/surveyors" />}
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
 </>
 );
}
