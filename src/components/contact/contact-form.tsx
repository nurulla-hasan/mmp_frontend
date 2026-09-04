"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inquiryCategories = [
  "সার্ভেয়ার অনুসন্ধান",
  "টুলস ও হিসাব সংক্রান্ত",
  "সার্ভেয়ার অ্যাকাউন্ট ও ভেরিফিকেশন",
  "পরামর্শ বা মতামত",
  "অন্যান্য",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState(inquiryCategories[0]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !contact.trim() || !message.trim()) {
      toast.error("অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("আপনার বার্তা সফলভাবে গৃহীত হয়েছে! আমরা দ্রুত যোগাযোগ করব।");
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
          ধন্যবাদ, {name}!
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          আপনার বার্তাটি আমাদের সাপোর্ট টিমের কাছে পৌঁছেছে। সাধারণত ২৪ ঘণ্টার মধ্যে আপনার প্রদত্ত ফোন বা ইমেইলে যোগাযোগ করা হবে।
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setName("");
            setContact("");
            setMessage("");
            setIsSubmitted(false);
          }}
        >
          নতুন বার্তা পাঠান
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MessageSquare className="size-5" />
        </div>
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">
            আমাদের সরাসরি বার্তা পাঠান
          </h3>
          <p className="text-xs text-muted-foreground">
            নিচের ফর্মটি পূরণ করুন, আমরা দ্রুত আপনার সাথে যোগাযোগ করব।
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name" className="text-xs font-medium">
              আপনার নাম <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-name"
              placeholder="যেমন: মোঃ করিম উল্লাহ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-info" className="text-xs font-medium">
              মোবাইল নাম্বার বা ইমেইল <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-info"
              placeholder="017XX-XXXXXX বা email@domain.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-category" className="text-xs font-medium">
            বিষয় নির্বাচন করুন
          </Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {inquiryCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-message" className="text-xs font-medium">
            আপনার বার্তা বা বিস্তারিত তথ্য <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="contact-message"
            placeholder="আপনার প্রশ্ন, জমি সংক্রান্ত কাজের বিবরণ বা কী ধরনের সেবা প্রয়োজন তা লিখুন..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="resize-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full gap-2 font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>পাঠানো হচ্ছে...</span>
          ) : (
            <>
              <Send className="size-4" />
              <span>বার্তা পাঠান</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

