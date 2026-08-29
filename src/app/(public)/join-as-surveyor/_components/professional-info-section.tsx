"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Briefcase, Award, FileText, Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import type { JoinAsSurveyorFormValues } from "@/validation/join-as-surveyor.schema";

export function ProfessionalInfoSection() {
  const { control } = useFormContext<JoinAsSurveyorFormValues>();

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Briefcase className="size-4 text-primary" />
        <h2 className="font-semibold text-foreground text-sm">
          পেশাগত পরিচিতি ও অভিজ্ঞতা
        </h2>
      </div>

      <div className="space-y-4">
        {/* Headline */}
        <Controller
          name="headline"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="headline">পেশাদার শিরোনাম (Headline) *</FieldLabel>
              <Input
                {...field}
                id="headline"
                placeholder="যেমন: জমি পরিমাপ ও ডিজিটাল সার্ভে বিশেষজ্ঞ"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                আপনার সার্ভে পেশার মূল দক্ষতা বা শিরোনাম লিখুন।
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Experience Years */}
        <Controller
          name="experienceYears"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="experienceYears">অভিজ্ঞতা (বছর) *</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="experienceYears"
                  type="number"
                  min={0}
                  max={50}
                  placeholder="যেমন: ১০"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  aria-invalid={fieldState.invalid}
                />
              </div>
              <FieldDescription>
                ভূমি জরিপ বা সার্ভে কাজের মোট অভিজ্ঞতার বছর।
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Bio */}
        <Controller
          name="bio"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="bio">সংক্ষিপ্ত পরিচিতি (Bio)</FieldLabel>
              <Textarea
                {...field}
                id="bio"
                placeholder="যেমন: আমি দীর্ঘ ১০ বছর ধরে বিশ্বস্ততার সাথে জমি জরিপ, সীমানা চিহ্নিতকরণ, জমি বাটোয়ারা ও ডিজিটাল নকশার কাজ করে আসছি..."
                rows={3}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                আপনার কাজের অভিজ্ঞতা, নির্ভরযোগ্যতা ও সার্ভিস সম্পর্কে সংক্ষেপে লিখুন।
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Certificate URL */}
        <Controller
          name="certificateUrl"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-1.5">
                <Award className="size-3.5 text-primary" />
                <FieldLabel htmlFor="certificateUrl">
                  সার্টিফিকেট বা সনদপত্র লিঙ্ক (ঐচ্ছিক)
                </FieldLabel>
              </div>
              <Input
                {...field}
                id="certificateUrl"
                placeholder="Google Drive, Dropbox বা ডকুমেন্টের পাবলিক লিংক"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                সার্ভে বা আমিনশিপ সার্টিফিকেটের ড্রাইভ লিঙ্ক বা পিডিএফ ইউআরএল দিতে পারেন।
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </div>
    </div>
  );
}

