import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "যোগাযোগ ও সহায়তা — আমাদের সাথে কথা বলুন",
  description:
    "Mouza Map Pro প্ল্যাটফর্ম সংক্রান্ত যেকোনো প্রশ্ন, মতামত বা কারিগরি সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।",
  keywords: [
    "যোগাযোগ",
    "Contact Mouza Map Pro",
    "কাস্টমার সাপোর্ট",
    "হেল্পলাইন",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "যোগাযোগ ও সহায়তা — আমাদের সাথে কথা বলুন | Mouza Map Pro",
    description:
      "Mouza Map Pro প্ল্যাটফর্ম সংক্রান্ত যেকোনো প্রশ্ন, মতামত বা কারিগরি সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।",
    url: "/contact",
  },
};

const contactInfo = [
  {
    icon: Phone,
    title: "ফোন",
    details: ["+880 1700-000000", "+880 1700-000001"],
    action: { label: "কল করুন", href: "tel:+8801700000000" },
  },
  {
    icon: Mail,
    title: "ইমেইল",
    details: ["support@mouzamappro.com", "info@mouzamappro.com"],
    action: { label: "ইমেইল পাঠান", href: "mailto:support@mouzamappro.com" },
  },
  {
    icon: MapPin,
    title: "ঠিকানা",
    details: ["১২৩, বাংলামোটর", "ঢাকা-১০০০, বাংলাদেশ"],
    action: { label: "Google Maps", href: "#" },
  },
  {
    icon: Clock,
    title: "অফিস সময়",
    details: ["শনি-বৃহস্পতি: ৯AM - ৬PM", "শুক্রবার: বন্ধ"],
    action: { label: "সাপোর্ট হাব", href: "/community" },
  },
];

const faqs = [
  {
    q: "কত দ্রুত উত্তর পাব?",
    a: "আমরা সাধারণত ২৪-৪৮ ঘন্টার মধ্যে ইমেইল ও ফোন কলের উত্তর দেওয়ার চেষ্টা করি। জরুরি প্রয়োজনে সরাসরি ফোনে যোগাযোগ করুন।",
  },
  {
    q: "সার্ভেয়ার সংক্রান্ত বিষয় কোথায় জানাব?",
    a: "সার্ভেয়ার সংক্রান্ত যেকোনো প্রশ্ন বা সহায়তার জন্য সরাসরি support@mouzamappro.com-এ ইমেইল করুন অথবা আমাদের হেল্পলাইনে যোগাযোগ করুন।",
  },
  {
    q: "আমি কি অফিসে সরাসরি আসতে পারি?",
    a: "পূর্বনির্ধারিত অ্যাপয়েন্টমেন্ট ছাড়া অফিসে আসার প্রয়োজন নেই। ডিজিটাল প্ল্যাটফর্মের মাধ্যমেই সমস্ত সেবা গ্রহণ করা যায়।",
  },
  {
    q: "কোনো মতামত বা পরামর্শ দিতে চাইলে?",
    a: "আমরা আপনার মূল্যবান মতামত ও পরামর্শকে স্বাগত জানাই। নিচের ফর্মের মাধ্যমে অথবা সরাসরি ইমেইল করে জানাতে পারেন।",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <SectionWrapper padding="lg">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 size-90 -translate-x-1/2 -translate-y-20 rounded-full bg-primary/20 blur-[100px]" />
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <MessageSquare className="size-8 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
            যোগাযোগ করুন
          </h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">
            আপনার প্রশ্ন, মতামত বা সহায়তার প্রয়োজন নিয়ে আমাদের জানান। আমরা সাহায্য করতে
            প্রস্তুত।
          </p>
          <p className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            জরুরি প্রয়োজনে ফোন বা ইমেইলের মাধ্যমে সরাসরি যোগাযোগ করতে পারেন।
          </p>
        </div>
      </SectionWrapper>

      {/* ─── Contact Info ──────────────────────────────────── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          title="যোগাযোগের তথ্য"
          description="নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করুন।"
          alignment="center"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-2 hover:ring-primary/20"
              >
                <CardContent className="text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
                  {item.details.map((d) => (
                    <p
                      key={d}
                      className="mt-1 text-sm leading-6 text-muted-foreground"
                    >
                      {d}
                    </p>
                  ))}
                  <Button
                    className="mt-4 w-full"
                    variant="outline"
                    size="xs"
                    nativeButton={false}
                    render={<Link href={item.action.href} />}
                  >
                    {item.action.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ─── Contact Form ──────────────────────────────────── */}
      <SectionWrapper padding="lg">
        <SectionHeading
          title="আমাদের একটি বার্তা দিন"
          description="নিচের ফর্মটি পূরণ করে আমাদের জানান। আমরা যত দ্রুত সম্ভব উত্তর দেব।"
          alignment="center"
        />
        <div className="mx-auto mt-10 max-w-2xl">
          <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="name">আপনার নাম</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="আপনার নাম লিখুন"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">ইমেইল</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="subject">বিষয়</FieldLabel>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="আপনার বার্তার বিষয় নির্বাচন করুন"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="message">বার্তা</FieldLabel>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
                  />
                </Field>

                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <Send className="size-4" />
                  বার্তা পাঠান
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      {/* ─── FAQ ───────────────────────────────────────────── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          badge="FAQ"
          title="সচরাচর জিজ্ঞাসা"
          alignment="center"
        />
        <div className="mt-8 mx-auto max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <Accordion>
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`contact-faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
            title="আপনার জমির কাজ শুরু করতে প্রস্তুত?"
            description="সার্ভেয়ার খুঁজুন, সরাসরি যোগাযোগ করুন বা Professional Profile তৈরি করুন।"
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
