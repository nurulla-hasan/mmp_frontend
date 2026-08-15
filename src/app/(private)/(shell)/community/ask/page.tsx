"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle, MessageSquare, Send } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
 Field,
 FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { categories } from "../_data";

export default function AskPage() {
 return (
 <>
 {/* ─── Hero ──────────────────────────────────────────── */}
 <SectionWrapper padding="lg">
 <div className="relative mx-auto max-w-3xl text-center">
  <div className="pointer-events-none absolute top-0 left-1/2 -z-10 size-90 -translate-x-1/2 -translate-y-20 rounded-full bg-primary/20 blur-[100px]" />
 <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
 <HelpCircle className="size-8 text-primary" />
 </div>
 <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
 প্রশ্ন জিজ্ঞাসা করুন
 </h1>
 <p className="mt-4 text-lg leading-7 text-muted-foreground">
 আপনার জমি সংক্রান্ত সমস্যা বিস্তারিত লিখুন। অভিজ্ঞ সার্ভেয়ার ও
 কমিউনিটি সদস্যরা উত্তর দিতে সাহায্য করবেন।
 </p>
 </div>
 </SectionWrapper>

 {/* ─── Form ──────────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="muted">
 <div className="mx-auto max-w-2xl">
 <Button
 variant="ghost"
 size="sm"
 className="mb-6"
 nativeButton={false}
 render={<Link href="/community" />}
 >
 <ArrowLeft className="size-4" />
 কমিউনিটিতে ফিরে যান
 </Button>
 <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
 <CardContent>
 <form
 onSubmit={(e) => e.preventDefault()}
 className="space-y-6"
 >
 {/* Title */}
 <Field>
 <FieldLabel htmlFor="title">প্রশ্নের শিরোনাম</FieldLabel>
 <Input
 id="title"
 type="text"
 placeholder="যেমন: ৩ কাঠা জমিতে কি ৪ তলা ভবন নির্মাণ সম্ভব?"
 />
 <p className="mt-1 text-xs text-muted-foreground">
 সংক্ষিপ্ত ও নির্দিষ্ট শিরোনাম দিন যাতে অন্যরা সহজে বুঝতে
 পারেন।
 </p>
 </Field>

 {/* Category */}
 <Field>
 <FieldLabel htmlFor="category">ক্যাটাগরি</FieldLabel>
 <Select>
 <SelectTrigger className="w-full" id="category">
 <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
 </SelectTrigger>
 <SelectContent>
 {categories.map((cat) => (
 <SelectItem key={cat.title} value={cat.title}>
 {cat.title}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </Field>

 {/* Description */}
 <Field>
 <FieldLabel htmlFor="description">
 বিস্তারিত বিবরণ
 </FieldLabel>
 <Textarea
 id="description"
 rows={6}
 placeholder="আপনার সমস্যা বা প্রশ্নটি বিস্তারিত লিখুন। প্রাসঙ্গিক তথ্য, জমির পরিমাণ, অবস্থান ইত্যাদি উল্লেখ করুন।"
 />
 <p className="mt-1 text-xs text-muted-foreground">
 যত বিস্তারিত লিখবেন, তত নির্ভুল উত্তর পাবেন। ব্যক্তিগত
 তথ্য (ফোন, ঠিকানা) পাবলিক পোস্টে শেয়ার করবেন না।
 </p>
 </Field>

 {/* Submit */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
 <Button type="submit" size="lg">
 <Send className="size-4" />
 প্রশ্ন জমা দিন
 </Button>
 <p className="text-xs text-muted-foreground">
 পোস্ট করার পর আপনার প্রশ্নটি কমিউনিটিতে প্রকাশিত হবে এবং
 অন্যরা উত্তর দিতে পারবেন।
 </p>
 </div>
 </form>
 </CardContent>
 </Card>

 {/* ─── Tips ────────────────────────────────────────── */}
 <div className="mt-8 rounded-lg border bg-card/50 p-5 ">
 <div className="flex items-start gap-3">
 <MessageSquare className="mt-0.5 size-5 shrink-0 text-primary" />
 <div>
 <h3 className="text-sm font-medium">
 একটি ভালো প্রশ্ন লেখার টিপস
 </h3>
 <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted-foreground">
 <li>
 • স্পষ্ট ও সংক্ষিপ্ত শিরোনাম ব্যবহার করুন যা সমস্যার মূল
 বর্ণনা করে।
 </li>
 <li>
 • জমির পরিমাণ, অবস্থান ও প্রাসঙ্গিক নথির তথ্য উল্লেখ করুন।
 </li>
 <li>
 • ইতিমধ্যে কী কী পদক্ষেপ নিয়েছেন তা জানান।
 </li>
 <li>
 • ব্যক্তিগত তথ্য (ফোন নম্বর, জাতীয় পরিচয়পত্র নম্বর) শেয়ার
 করা থেকে বিরত থাকুন।
 </li>
 </ul>
 </div>
 </div>
 </div>
 </div>
 </SectionWrapper>

 {/* ─── CTA ───────────────────────────────────────────── */}
 <SectionWrapper padding="lg" bg="primary">
 <div className="relative">
 <div className="pointer-events-none absolute inset-0 mx-auto size-80 rounded-full bg-primary/10 " />
 <SectionHeading
 as="h2"
 title="ইতিমধ্যে প্রশ্ন আছে?"
 description="পোস্ট করার আগে একবার কমিউনিটির বিদ্যমান প্রশ্নগুলো ব্রাউজ করে নিন। আপনার প্রশ্নের উত্তর ইতিমধ্যে দেওয়া থাকতে পারে।"
 alignment="center"
 />
 <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Button
 size="lg"
 variant="outline"
 nativeButton={false}
 render={<Link href="/community" />}
 >
 প্রশ্ন ব্রাউজ করুন
 </Button>
 </div>
 </div>
 </SectionWrapper>
 </>
 );
}
