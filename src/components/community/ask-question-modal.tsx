"use client";

import { MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ModalWrapper } from "@/components/ui/custom/modal-wrapper";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { categories } from "@/app/(private)/community/_data";

export function AskQuestionModal() {
 return (
 <ModalWrapper
 title="প্রশ্ন জিজ্ঞাসা করুন"
 description="আপনার জমি সংক্রান্ত সমস্যা বিস্তারিত লিখুন। অভিজ্ঞ সার্ভেয়ার ও কমিউনিটি সদস্যরা উত্তর দিতে সাহায্য করবেন।"
 actionTrigger={<Button size="lg">প্রশ্ন জিজ্ঞাসা করুন</Button>}
 >
 <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
 {/* Title */}
 <Field>
 <FieldLabel htmlFor="ask-title">প্রশ্নের শিরোনাম</FieldLabel>
 <Input
 id="ask-title"
 type="text"
 placeholder="যেমন: ৩ কাঠা জমিতে কি ৪ তলা ভবন নির্মাণ সম্ভব?"
 />
 <p className="mt-1 text-xs text-muted-foreground">
 সংক্ষিপ্ত ও নির্দিষ্ট শিরোনাম দিন যাতে অন্যরা সহজে বুঝতে পারেন।
 </p>
 </Field>

 {/* Category */}
 <Field>
 <FieldLabel htmlFor="ask-category">ক্যাটাগরি</FieldLabel>
 <Select>
 <SelectTrigger className="w-full" id="ask-category">
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
 <FieldLabel htmlFor="ask-description">বিস্তারিত বিবরণ</FieldLabel>
 <Textarea
 id="ask-description"
 rows={6}
 placeholder="আপনার সমস্যা বা প্রশ্নটি বিস্তারিত লিখুন। প্রাসঙ্গিক তথ্য, জমির পরিমাণ, অবস্থান ইত্যাদি উল্লেখ করুন।"
 />
 <p className="mt-1 text-xs text-muted-foreground">
 যত বিস্তারিত লিখবেন, তত নির্ভুল উত্তর পাবেন। ব্যক্তিগত তথ্য (ফোন,
 ঠিকানা) পাবলিক পোস্টে শেয়ার করবেন না।
 </p>
 </Field>

 {/* Submit */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
 <Button type="submit" size="lg">
 <Send className="size-4" />
 প্রশ্ন জমা দিন
 </Button>
 <p className="text-xs text-muted-foreground">
 পোস্ট করার পর আপনার প্রশ্নটি কমিউনিটিতে প্রকাশিত হবে এবং অন্যরা
 উত্তর দিতে পারবেন।
 </p>
 </div>
 </form>

 {/* Tips */}
 <div className="mt-6 rounded-lg border bg-card/50 p-5 ">
 <div className="flex items-start gap-3">
 <MessageSquare className="mt-0.5 size-5 shrink-0 text-primary" />
 <div>
 <h3 className="text-sm font-medium">একটি ভালো প্রশ্ন লেখার টিপস</h3>
 <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted-foreground">
 <li>
 • স্পষ্ট ও সংক্ষিপ্ত শিরোনাম ব্যবহার করুন যা সমস্যার মূল বর্ণনা
 করে।
 </li>
 <li>
 • জমির পরিমাণ, অবস্থান ও প্রাসঙ্গিক নথির তথ্য উল্লেখ করুন।
 </li>
 <li>• ইতিমধ্যে কী কী পদক্ষেপ নিয়েছেন তা জানান।</li>
 <li>
 • ব্যক্তিগত তথ্য (ফোন নম্বর, জাতীয় পরিচয়পত্র নম্বর) শেয়ার করা
 থেকে বিরত থাকুন।
 </li>
 </ul>
 </div>
 </div>
 </div>
 </ModalWrapper>
 );
}
