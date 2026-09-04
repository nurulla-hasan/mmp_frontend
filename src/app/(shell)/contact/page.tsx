import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Users,
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
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "যোগাযোগ ও সহায়তা — আমাদের সাথে কথা বলুন",
  description:
    "Mouza Map Pro প্ল্যাটফর্ম সংক্রান্ত যেকোনো প্রশ্ন, মতামত বা কারিগরি সহায়তার জন্য সরাসরি কল, WhatsApp বা ইমেইলে আমাদের সাথে যোগাযোগ করুন।",
  keywords: [
    "যোগাযোগ",
    "Contact Mouza Map Pro",
    "কাস্টমার সাপোর্ট",
    "হেল্পলাইন",
    "WhatsApp সাপোর্ট",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "যোগাযোগ ও সহায়তা — আমাদের সাথে কথা বলুন | Mouza Map Pro",
    description:
      "Mouza Map Pro প্ল্যাটফর্ম সংক্রান্ত যেকোনো প্রশ্ন, মতামত বা কারিগরি সহায়তার জন্য সরাসরি কল, WhatsApp বা ইমেইলে আমাদের সাথে যোগাযোগ করুন।",
    url: "/contact",
  },
};

const contactInfo = [
  {
    icon: Phone,
    title: "সরাসরি কল",
    details: ["+880 1750-974716", "যেকোনো জরুরি প্রয়োজনে"],
    action: { label: "কল করুন", href: "tel:+8801750974716" },
  },
  {
    icon: MessageCircle,
    title: "WhatsApp চ্যাট",
    details: ["তাৎক্ষণিক সহায়তা ও তথ্য", "+880 1750-974716"],
    action: {
      label: "WhatsApp-এ লিখুন",
      href: "https://wa.me/8801750974716",
      external: true,
    },
  },
  {
    icon: Mail,
    title: "অফিসিয়াল ইমেইল",
    details: ["golaphasan379@gmail.com", "২৪ ঘন্টার মধ্যে রিপ্লাই"],
    action: { label: "ইমেইল পাঠান", href: "mailto:golaphasan379@gmail.com" },
  },
  {
    icon: Users,
    title: "কমিউনিটি সাপোর্ট",
    details: ["প্রশ্নোত্তর ফোরাম", "অভিজ্ঞ সার্ভেয়ারদের সমাধান"],
    action: { label: "কমিউনিটিতে যান", href: "/community" },
  },
];

const officeDetails = [
  {
    icon: MapPin,
    title: "প্রধান কার্যালয়",
    value: "১২৩, বাংলামোটর, ঢাকা-১০০০, বাংলাদেশ",
  },
  {
    icon: Clock,
    title: "সাপোর্ট সময়সূচী",
    value: "শনিবার – বৃহস্পতিবার: সকাল ৯টা থেকে রাত ১০টা",
  },
];

const faqs = [
  {
    q: "কত দ্রুত সাপোর্ট থেকে উত্তর পাব?",
    a: "আমরা ফোন ও WhatsApp-এ তাৎক্ষণিকভাবে এবং ইমেইলে সাধারণত দ্রুততম সময়ের মধ্যে উত্তর দেওয়ার চেষ্টা করি। জরুরি প্রয়োজনে সরাসরি ফোনে যোগাযোগ করুন।",
  },
  {
    q: "সার্ভেয়ার সংক্রান্ত বিষয় কোথায় জানাব?",
    a: "সার্ভেয়ার সংক্রান্ত যেকোনো প্রশ্ন বা সহায়তার জন্য সরাসরি golaphasan379@gmail.com-এ ইমেইল করুন অথবা আমাদের হেল্পলাইনে (+8801750974716) যোগাযোগ করুন।",
  },
  {
    q: "আমি কি অফিসে সরাসরি আসতে পারি?",
    a: "পূর্বনির্ধারিত অ্যাপয়েন্টমেন্ট ছাড়া অফিসে আসার প্রয়োজন নেই। ডিজিটাল প্ল্যাটফর্ম ও অনলাইন সাপোর্টের মাধ্যমেই সমস্ত সেবা দ্রুত গ্রহণ করা যায়।",
  },
  {
    q: "কোনো মতামত বা পরামর্শ দিতে চাইলে?",
    a: "আমরা আপনার মূল্যবান মতামত ও পরামর্শকে স্বাগত জানাই। সরাসরি ইমেইল (golaphasan379@gmail.com) অথবা WhatsApp-এ (+8801750974716) আমাদের জানাতে পারেন।",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <SectionWrapper padding="lg">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 size-90 -translate-x-1/2 -translate-y-20 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_70%)]" />
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <MessageSquare className="size-8 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
            যোগাযোগ ও সহায়তা
          </h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">
            আপনার যেকোনো প্রশ্ন, প্ল্যাটফর্ম ব্যবহারের সহায়তা বা পরামর্শের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <a
                  href="https://wa.me/8801750974716"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a]"
            >
              <MessageCircle className="size-5" />
              WhatsApp-এ সরাসরি কথা বলুন
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<a href="tel:+8801750974716" />}
              className="gap-2"
            >
              <Phone className="size-4" />
              সরাসরি কল করুন
            </Button>
          </div>
        </div>
      </SectionWrapper>

      {/* ─── Contact Channels ──────────────────────────────── */}
      <SectionWrapper padding="lg" bg="muted">
        <SectionHeading
          title="সরাসরি যোগাযোগের মাধ্যম"
          description="নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করতে পারেন।"
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
                    size="sm"
                    nativeButton={false}
                    render={
                      item.action.external ? (
                        <a
                          href={item.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ) : (
                        <Link href={item.action.href} />
                      )
                    }
                  >
                    {item.action.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionWrapper>

      {/* ─── Contact Form & Office Info ────────────────────── */}
      <SectionWrapper padding="lg">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <div>
            <SectionHeading
              badge="বার্তা পাঠান"
              title="কোনো প্রশ্ন বা পরামর্শ আছে?"
              description="অনলাইনে ফর্ম পূরণ করে আমাদের জানান। আমাদের টিম আপনার দেওয়া নম্বরে বা ইমেইলে দ্রুত উত্তর দেবে।"
            />

            <div className="mt-8 space-y-4">
              {officeDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-2xs"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.title}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ContactForm />
        </div>
      </SectionWrapper>

      {/* ─── FAQ ───────────────────────────────────────────── */}
      <SectionWrapper padding="lg">
        <SectionHeading
          badge="FAQ"
          title="সচরাচর জিজ্ঞাসা"
          description="যোগাযোগ ও সহায়তা সংক্রান্ত সাধারণ প্রশ্নের উত্তর।"
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
