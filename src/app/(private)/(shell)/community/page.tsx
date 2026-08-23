"use client";

import Link from "next/link";
import {
 MessageSquare,
 Users,
} from "lucide-react";

import { AskQuestionModal } from "./_components/ask-question-modal";
import { FaqAccordion } from "./_components/faq-accordion";
import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
 categories,
 recentQuestions,
 stats,
 topContributors,
} from "./_data";


export default function CommunityPage() {
 return (
 <>
 {/* ─── Hero ──────────────────────────────────────────── */}
 <SectionWrapper padding="lg">
 <div className="relative mx-auto max-w-3xl text-center">
  <div className="pointer-events-none absolute top-0 left-1/2 -z-10 size-90 -translate-x-1/2 -translate-y-20 rounded-full bg-primary/20 blur-[100px]" />
 <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
 <Users className="size-8 text-primary" />
 </div>
 <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
 কমিউনিটি Q&A
 </h1>
 <p className="mt-4 text-lg leading-7 text-muted-foreground">
 জমি সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞাসা করুন এবং অভিজ্ঞ সার্ভেয়ার ও
 কমিউনিটির কাছ থেকে উত্তর পান।
 </p>
 <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <AskQuestionModal />
 <Button
 size="lg"
 variant="outline"
 nativeButton={false}
 render={<Link href="#categories" />}
 >
 ক্যাটাগরি ব্রাউজ করুন
 </Button>
 </div>
 </div>
 </SectionWrapper>

 {/* ─── Stats ─────────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
 {stats.map((stat) => (
 <div
 key={stat.label}
 className="rounded-xl border bg-card px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
 >
 <p className="text-3xl font-bold tracking-tight text-primary font-heading">
 {stat.number}
 </p>
 <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
 </div>
 ))}
 </div>
 </SectionWrapper>

 {/* ─── Categories ────────────────────────────────────── */}
 <SectionWrapper padding="lg" id="categories">
 <SectionHeading
 badge="ক্যাটাগরি"
 title="কোন বিষয়ে জানতে চান?"
 description="আপনার প্রশ্নের ক্যাটাগরি নির্বাচন করুন এবং দ্রুত উত্তর পান।"
 alignment="center"
 />
 <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {categories.map((cat) => {
 const Icon = cat.icon;
 return (
 <Card
 key={cat.title}
 className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:ring-2 hover:ring-primary/20"
 >
 <CardContent>
 <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <Icon className="size-6" />
 </div>
 <h3 className="mt-4 text-sm font-medium">{cat.title}</h3>
 <p className="mt-1 text-xs text-muted-foreground">
 {cat.count}
 </p>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 {cat.desc}
 </p>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </SectionWrapper>

 {/* ─── Recent Questions + Sidebar ────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <SectionHeading
 badge="সাম্প্রতিক প্রশ্ন"
 title="কী নিয়ে আলোচনা হচ্ছে?"
 description="কমিউনিটির সাম্প্রতিক প্রশ্ন ও উত্তর দেখুন।"
 alignment="center"
 />
 <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
 {/* ── Question List ── */}
 <div className="space-y-4">
 {recentQuestions.map((q) => (
 <Card
 key={q.id}
 className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
 >
 <CardContent>
 <div className="flex items-start gap-4">
 <Avatar size="default" className="mt-0.5 shrink-0">
 <AvatarFallback>{q.avatar}</AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="text-sm font-medium leading-snug">
 {q.title}
 </h3>
 {q.hasAccepted && (
 <Badge className="shrink-0 bg-green-600/10 p-2 text-green-700 hover:bg-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20">
 সমাধানকৃত
 </Badge>
 )}
 </div>
 <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
 {q.preview}
 </p>
 <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
 <Badge variant="secondary" className="p-2">
 {q.category}
 </Badge>
 <span>{q.author}</span>
 <span>{q.time}</span>
 <span className="flex items-center gap-1">
 <MessageSquare className="size-3" />
 {q.answers} টি উত্তর
 </span>
 <span>{q.votes} ভোট</span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* ── Sidebar: Top Contributors ── */}
 <div>
 <Card className="sticky top-24">
 <CardContent>
 <h3 className="flex items-center gap-2 text-sm font-medium">
 <Users className="size-4 text-primary" />
 শীর্ষ সদস্য
 </h3>
 <p className="mt-1 text-xs text-muted-foreground">
 যারা সবচেয়ে বেশি উত্তর দিয়েছেন
 </p>
 <div className="mt-5 space-y-4">
 {topContributors.map((person) => (
 <div
 key={person.name}
 className="flex items-center gap-3"
 >
 <Avatar size="sm" className="shrink-0">
 <AvatarFallback>{person.avatar}</AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5">
 <p className="truncate text-sm font-medium leading-tight">
 {person.name}
 </p>
 {person.verified && (
 <Badge className="shrink-0 bg-primary/10 p-1.5 text-[10px] leading-none text-primary">
 ✓
 </Badge>
 )}
 </div>
 <p className="text-xs text-muted-foreground">
 {person.role} &middot; {person.answers} উত্তর
 </p>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </SectionWrapper>

 {/* ─── How It Works ──────────────────────────────────── */}
 <SectionWrapper padding="lg">
 <SectionHeading
 badge="কীভাবে কাজ করে"
 title="কমিউনিটি Q&A ব্যবহারের ৩টি সহজ ধাপ"
 description="নিচের ধাপগুলো অনুসরণ করে আপনার প্রশ্নের উত্তর খুঁজে নিন।"
 alignment="center"
 />
 <div className="mt-10 grid gap-8 md:grid-cols-3">
 {[
 {
 step: "১",
 title: "প্রশ্ন লিখুন",
 desc: "আপনার জমি সংক্রান্ত সমস্যা বিস্তারিত লিখুন এবং সঠিক ক্যাটাগরি নির্বাচন করুন।",
 },
 {
 step: "২",
 title: "উত্তর পান",
 desc: "অভিজ্ঞ সার্ভেয়ার ও কমিউনিটি সদস্যরা আপনার প্রশ্নের উত্তর দেবেন।",
 },
 {
 step: "৩",
 title: "সঠিক উত্তর নির্বাচন করুন",
 desc: "সবচেয়ে নির্ভুল উত্তরটি 'এক্সেপ্টেড' হিসেবে চিহ্নিত করে অন্যদের সাহায্য করুন।",
 },
 ].map((item, i) => (
 <div key={item.step} className="relative text-center">
 {i < 2 && (
 <div className="absolute left-[calc(50%+24px)] top-6 hidden h-0.5 w-[calc(100%-48px)] bg-primary/20 md:block" />
 )}
 <div className="flex flex-col items-center">
 <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/20">
 <span className="text-xl font-bold text-primary">
 {item.step}
 </span>
 </div>
 <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 {item.desc}
 </p>
 </div>
 </div>
 ))}
 </div>
 </SectionWrapper>

 {/* ─── FAQ ───────────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <SectionHeading
 badge="FAQ"
 title="সচরাচর জিজ্ঞাসা"
 description="কমিউনিটি সম্পর্কে সাধারণ প্রশ্নের উত্তর।"
 alignment="center"
 />
 <div className="mt-8">
 <FaqAccordion />
 </div>
 </SectionWrapper>

 {/* ─── Final CTA ─────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="primary">
 <div className="relative">
 <div className="pointer-events-none absolute inset-0 mx-auto size-80 rounded-full bg-primary/10 " />
 <SectionHeading
 as="h2"
 title="আপনার প্রশ্ন জিজ্ঞাসা করুন"
 description="জমি সংক্রান্ত যেকোনো সমস্যা এখনই জানান। বিশেষজ্ঞ ও কমিউনিটি সদস্যরা সাহায্য করতে প্রস্তুত।"
 alignment="center"
 />
 <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <AskQuestionModal />
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
