"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Loader2, MessageCircle } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FieldGroup,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import { SERVICE_OPTIONS } from "@/components/join-as-surveyor/schema";
import type { TSurveyorServiceWithPrice } from "@/types/surveyor-profile.type";

// ─── Mock: fetch existing services ─────────────────────
function useServices() {
  const [services, setServices] = useState<TSurveyorServiceWithPrice[]>([
    {
      id: "s-001",
      slug: "land-measurement",
      name: "জমি পরিমাপ",
      startingPrice: 3500,
    },
    {
      id: "s-002",
      slug: "land-division",
      name: "জমি ভাগ",
      startingPrice: 5000,
    },
  ]);

  return { services, setServices };
}

export default function Page() {
  const { services, setServices } = useServices();
  const [isSaving, setIsSaving] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("8801712345678");

  const selectedSlugs = services.map((s) => s.slug);

  function addService(slug: string) {
    const option = SERVICE_OPTIONS.find((o) => o.value === slug);
    if (!option) return;
    setServices((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        slug: option.value,
        name: option.label,
        startingPrice: null,
      },
    ]);
  }

  function removeService(slug: string) {
    setServices((prev) => prev.filter((s) => s.slug !== slug));
  }

  function updatePrice(slug: string, price: string) {
    const num = price === "" ? null : Number(price);
    setServices((prev) =>
      prev.map((s) => (s.slug === slug ? { ...s, startingPrice: num } : s)),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      console.log("Saving services:", services);
      console.log("Saving whatsappNumber:", whatsappNumber);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      SuccessToast("প্রোফাইল সংরক্ষিত হয়েছে!");
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error
          ? error.message
          : "সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const availableServices = SERVICE_OPTIONS.filter(
    (opt) => !selectedSlugs.includes(opt.value),
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        title="সেবা ও মূল্য তালিকা"
        description="আপনার প্রদেয় সেবা এবং প্রতিটি সেবার প্রারম্ভিক মূল্য নির্ধারণ করুন। ক্লায়েন্টরা আপনার প্রোফাইলে এই তালিকা দেখতে পাবেন।"
        alignment="left"
      />

      {/* ── WhatsApp Number ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" />
            WhatsApp নম্বর
          </CardTitle>
          <FieldDescription>
            ক্লায়েন্টরা আপনার সাথে সরাসরি WhatsApp-এ যোগাযোগ করতে পারবেন। নম্বরটি
            প্রোফাইল ও সার্ভেয়ার তালিকায় প্রকাশিত হবে।
          </FieldDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldLabel>WhatsApp নম্বর (বৈকল্পিক)</FieldLabel>
            <Input
              type="tel"
              placeholder="88017XXXXXXXX"
              className="max-w-xs"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <FieldDescription>
              +৮৮০ এর পর ১০ সংখ্যার নম্বর দিন। যেমন: 8801712345678
            </FieldDescription>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* ── Selected services ── */}
      <Card>
        <CardHeader>
          <CardTitle>আপনার সেবাসমূহ</CardTitle>
          <FieldDescription>
            আপনি যেসব সেবা প্রদান করেন, প্রতিটির জন্য প্রারম্ভিক মূল্য দিন।
          </FieldDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              এখনো কোনো সেবা যোগ করেননি। নিচের তালিকা থেকে সেবা নির্বাচন করুন।
            </p>
          ) : (
            <FieldGroup className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.slug}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{service.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">৳</span>
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        placeholder="মূল্য"
                        className="h-8 w-24 text-sm"
                        value={
                          service.startingPrice != null
                            ? service.startingPrice
                            : ""
                        }
                        onChange={(e) =>
                          updatePrice(service.slug, e.target.value)
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        থেকে
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`${service.name} সরান`}
                      onClick={() => removeService(service.slug)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </FieldGroup>
          )}
        </CardContent>
      </Card>

      {/* ── Add services ── */}
      {availableServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>সেবা যোগ করুন</CardTitle>
            <FieldDescription>
              নিচের তালিকা থেকে আপনার পছন্দের সেবা নির্বাচন করুন।
            </FieldDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableServices.map((opt) => (
                <Button
                  key={opt.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addService(opt.value)}
                >
                  <Plus className="size-3.5" />
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* ── Save ── */}
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div>
          <p className="text-sm font-medium">পরিবর্তনগুলি সংরক্ষণ করুন</p>
          <p className="text-xs text-muted-foreground">
            {services.length} টি সেবা নির্বাচিত
          </p>
        </div>
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              সংরক্ষণ হচ্ছে...
            </>
          ) : (
            <>
              <Save className="size-4" />
              সংরক্ষণ করুন
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
