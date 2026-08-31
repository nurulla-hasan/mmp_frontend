"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
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
    }
  }

  // If application was submitted successfully in this session
  if (isSubmitted) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            আপনার আবেদন সফলভাবে জমা হয়েছে!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            ধন্যবাদ! মৌজা ম্যাপ প্রো এডমিন প্যানেল আপনার দেওয়া তথ্য ও সনদ যাচাই
            করবেন। যাচাই সম্পন্ন হলে আপনার প্রোফাইল ভেরিফায়েড সার্ভেয়ার
            হিসেবে তালিকাভুক্ত হবে।
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Button render={<Link href="/dashboard" />}>
            ড্যাশবোর্ডে যান
          </Button>
          <Button
            variant="outline"
            render={<Link href="/surveyors" />}
          >
            অন্যান্য সার্ভেয়ারদের দেখুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Intro */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/5 via-card to-background p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Sparkles className="size-3.5" />
          <span>সার্ভেয়ার পার্টনারশিপ প্রোগ্রাম</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
          প্রফেশনাল সার্ভেয়ার হিসেবে যোগ দিন
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          আপনার পেশাদার ভূমি জরিপ সেবা দেশের হাজার হাজার ক্লায়েন্টের কাছে পৌঁছে
          দিন। মৌজা ম্যাপ প্রো প্ল্যাটফর্মে তালিকাভুক্ত হয়ে নতুন ক্লায়েন্ট ও
          কাজের সুযোগ তৈরি করুন।
        </p>

        {/* Benefits Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-background/80">
            <Users2 className="size-5 text-primary shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">সরাসরি ক্লায়েন্ট</p>
              <p className="text-muted-foreground">এলাকাভিত্তিক সরাসরি কল ও বুকিং</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-background/80">
            <Award className="size-5 text-primary shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">ভেরিফায়েড ব্যাজ</p>
              <p className="text-muted-foreground">বিশ্বস্ত সার্ভেয়ারের পরিচয়</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl border bg-background/80">
            <ShieldCheck className="size-5 text-primary shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-foreground">সার্ভিস পোর্টফোলিও</p>
              <p className="text-muted-foreground">কাজের বিবরণ ও রিভিউ শোকেস</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Auth Warning Banner if not logged in */}
      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-semibold">
                আবেদন জমা দিতে আপনার মৌজা ম্যাপ প্রো অ্যাকাউন্ট প্রয়োজন
              </p>
              <p className="text-amber-800/80 dark:text-amber-300/80">
                আপনি এখনও লগইন করেননি। ফর্ম পূরণ করতে পারেন, কিন্তু জমা দেওয়ার আগে লগইন করতে হবে।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              render={<Link href="/login?callbackUrl=/join-as-surveyor" />}
            >
              <LogIn />
              লগইন করুন
            </Button>
            <Button
              render={<Link href="/register?callbackUrl=/join-as-surveyor" />}
            >
              <UserPlus />
              রেজিস্ট্রেশন
            </Button>
          </div>
        </div>
      )}

      {/* 3. Multi-Section Application Form */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FieldSet>
            <FieldGroup className="space-y-8">
              {/* Section 1: Professional Bio & Headline */}
              <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-6">
                <SectionHeading
                  title="১. পেশাগত পরিচিতি ও সনদ"
                  description="আপনার পদবী, অভিজ্ঞতা, বিবরণ ও শিক্ষাগত/পেশাদার সনদের লিঙ্ক দিন।"
                />
                <ProfessionalInfoSection />
              </div>

              {/* Section 2: Services Offered */}
              <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-6">
                <SectionHeading
                  title="২. আপনি যে সেবাসমূহ প্রদান করেন"
                  description="কমপক্ষে ১টি সেবা নির্বাচন করুন এবং প্রতিটির প্রাথমিক শুরুর মূল্য (টাকায়) নির্ধারণ করুন।"
                />
                <ServicesSection services={services} />
              </div>

              {/* Section 3: Service Areas Coverage */}
              <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-6">
                <SectionHeading
                  title="৩. সেবার ভৌগোলিক এলাকা"
                  description="আপনি যে জেলা এবং উপজেলাগুলোতে সশরীরে উপস্থিত হয়ে সেবা দিতে সক্ষম তা নির্বাচন করুন।"
                />
                <ServiceAreasSection districts={districts} />
              </div>

              {/* Section 4: Terms & Final Submission */}
              <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-5">
                <SectionHeading
                  title="৪. নিয়মনীতি ও সম্মতি"
                  description="আবেদন জমা দেওয়ার পূর্বে শর্তাবলীতে সম্মতি প্রদান করুন।"
                />

                <div className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-muted/40 border text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-1">
                      সার্ভেয়ার কোড অব কন্ডাক্ট:
                    </p>
                    আমি নিশ্চয়তা দিচ্ছি যে প্রদত্ত সকল তথ্য ও সনদ সত্য এবং
                    সঠিক। ক্লায়েন্টের সাথে পেশাদারিত্ব ও সততার সাথে সেবা প্রদানে
                    আমি প্রতিশ্রুতিবদ্ধ।
                  </div>

                  <div className="space-y-4">
                    <Controller
                      name="terms"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <label className="flex items-start gap-2.5 cursor-pointer">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(c) => field.onChange(!!c)}
                              className="mt-0.5"
                            />
                            <span className="text-xs text-foreground leading-snug">
                              আমি মৌজা ম্যাপ প্রো-এর সার্ভেয়ার শর্তাবলী ও নীতিমালা মেনে নিয়ে আবেদন করছি।
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
                        className="w-full cursor-pointer"
                        disabled={!isAuthenticated}
                        loading={form.formState.isSubmitting}
                        loadingText="আবেদন জমা হচ্ছে..."
                      >
                        <Send />
                        {isAuthenticated
                          ? "সার্ভেয়ার আবেদন জমা দিন"
                          : "আবেদন করতে প্রথমে লগইন করুন"}
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
