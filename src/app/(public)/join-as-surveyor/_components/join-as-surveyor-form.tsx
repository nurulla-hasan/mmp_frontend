"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  Loader2,
  Send,
  CheckCircle2,
  ShieldAlert,
  LogIn,
  UserPlus,
  ShieldCheck,
  Award,
  Users2,
  Sparkles,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TAuthUser } from "@/interface/auth";
import type { TSurveyorService } from "@/interface/surveyor-profile";

import { joinAsSurveyorSchema, type JoinAsSurveyorFormValues } from "@/validation/join-as-surveyor.schema";
import { submitSurveyorApplicationAction } from "../_actions/apply.action";
import { ProfessionalInfoSection } from "./professional-info-section";
import { ServicesSection } from "./services-section";
import { ServiceAreasSection } from "./service-areas-section";

type DistrictOption = { value: string; label: string; upazilas: string[] };

interface JoinAsSurveyorFormProps {
  isAuthenticated: boolean;
  user?: TAuthUser;
  districts: DistrictOption[];
  services: TSurveyorService[];
}

export function JoinAsSurveyorForm({
  isAuthenticated,
  user,
  districts,
  services,
}: JoinAsSurveyorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<JoinAsSurveyorFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(joinAsSurveyorSchema as any),
    defaultValues: {
      headline: "",
      experienceYears: 1,
      bio: "",
      certificateUrl: "",
      services: [],
      serviceAreas: [],
      terms: false,
    },
  });

  async function onSubmit(data: JoinAsSurveyorFormValues) {
    if (!isAuthenticated) {
      ErrorToast("আবেদন করার জন্য প্রথমে লগইন করুন।");
      router.push("/login?callbackUrl=/join-as-surveyor");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSurveyorApplicationAction(data);
      if (!res.success) {
        ErrorToast(res.message);
        return;
      }

      SuccessToast(res.message);
      setIsSubmitted(true);
      form.reset();
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error
          ? error.message
          : "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // If application was submitted successfully in this session
  if (isSubmitted) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          আবেদন সফলভাবে জমা হয়েছে!
        </h2>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground leading-relaxed">
          আপনার পেশাগত সার্ভেয়ার প্রোফাইল আবেদনটি অ্যাডমিন রিভিউয়ের জন্য জমা
          নেওয়া হয়েছে। যাচাইকরণ সম্পন্ন হলে আপনার প্রোফাইলটি প্ল্যাটফর্মে
          প্রকাশিত হবে।
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/" />}>
            হোমপেজে যান
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/tools" />}
          >
            ল্যান্ড টুলস দেখুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b pb-5">
        <SectionHeading
          title="সার্ভেয়ার হিসেবে আবেদন করুন"
          description="আপনার পেশাগত অভিজ্ঞতা ও সেবার তথ্য প্রদান করে MMP ভেরিফাইড সার্ভেয়ার নেটওয়ার্কে যুক্ত হন।"
          as="h3"
          alignment="left"
          constrain={false}
        >
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground shrink-0">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-muted-foreground/70">
                  {user.email || user.phone}
                </p>
              </div>
            </div>
          ) : null}
        </SectionHeading>
      </div>


      {/* Unauthenticated Alert Banner */}
      {!isAuthenticated && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium">
              সার্ভেয়ার হিসেবে আবেদন করতে আপনার একটি একাউন্ট থাকা প্রয়োজন।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-card hover:bg-muted"
              nativeButton={false}
              render={<Link href="/login?callbackUrl=/join-as-surveyor" />}
            >
              <LogIn className="size-3.5" />
              লগইন
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/register?callbackUrl=/join-as-surveyor" />}
            >
              <UserPlus className="size-3.5" />
              রেজিস্টার
            </Button>
          </div>
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              {/* Responsive 2-Column Grid on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <ProfessionalInfoSection />

                  {/* Benefit / Verification Badge Note Card */}
                  <div className="rounded-xl border bg-muted/20 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                      <Sparkles className="size-4" />
                      ভেরিফাইড সার্ভেয়ার হওয়ার সুবিধা
                    </div>
                    <ul className="space-y-2.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                        <span>
                          প্রোফাইলে <strong>ভেরিফাইড ব্যাজ</strong> ও
                          বিশ্বাসযোগ্যতা বৃদ্ধি
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users2 className="size-3.5 shrink-0 text-primary mt-0.5" />
                        <span>
                          আপনার এলাকার ক্লায়েন্টদের থেকে সরাসরি জমি পরিমাপের
                          কাজ পাওয়ার সুযোগ
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="size-3.5 shrink-0 text-amber-500 mt-0.5" />
                        <span>
                          পেশাদার সার্ভে রেটিং ও ক্লায়েন্ট রিভিউ অর্জনের সুযোগ
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Column (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <ServicesSection services={services} />
                  <ServiceAreasSection districts={districts} />

                  {/* Terms & Submit Card */}
                  <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
                    <Controller
                      name="terms"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <label className="flex items-start gap-3 cursor-pointer select-none">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-xs text-muted-foreground leading-relaxed">
                              আমি নিশ্চিত করছি যে আমার প্রদত্ত পেশাগত তথ্য,
                              অভিজ্ঞতা এবং সেবার এলাকা সঠিক। আমি শর্তাবলীতে
                              সম্মতি জানাচ্ছি এবং যাচাইকরণের জন্য অ্যাডমিন
                              পর্যালোচনার অনুমোদন দিচ্ছি।
                            </span>
                          </label>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Field>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting || !isAuthenticated}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            আবেদন জমা হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            {isAuthenticated
                              ? "সার্ভেয়ার আবেদন জমা দিন"
                              : "আবেদন করতে প্রথমে লগইন করুন"}
                          </>
                        )}
                      </Button>
                    </Field>
                  </div>
                </div>
              </div>
            </FieldGroup>
          </FieldSet>
        </form>
      </FormProvider>
    </div>
  );
}
