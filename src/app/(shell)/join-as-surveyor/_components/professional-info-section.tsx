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
import { CertificateUpload } from "./certificate-upload";

interface ProfessionalInfoSectionProps {
  certificateFile: File | null;
  onCertificateFileChange: (file: File | null) => void;
  isSubmitting?: boolean;
}

export function ProfessionalInfoSection({
  certificateFile,
  onCertificateFileChange,
  isSubmitting = false,
}: ProfessionalInfoSectionProps) {
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
              <FieldLabel htmlFor="experienceYears">কাজের অভিজ্ঞতা (বছর) *</FieldLabel>
              <Input
                {...field}
                id="experienceYears"
                type="number"
                min={0}
                max={50}
                placeholder="যেমন: ৫"
                onChange={(e) => field.onChange(Number(e.target.value))}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                সার্ভে বা জমি পরিমাপ পেশায় আপনার মোট কাজের অভিজ্ঞতা (বছরে)।
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
              <FieldLabel htmlFor="bio">সংক্ষিপ্ত বিবরণ (Bio)</FieldLabel>
              <Textarea
                {...field}
                id="bio"
                placeholder="আপনার কাজের অভিজ্ঞতা, বিশেষত্ব, সার্টিফিকেট ইত্যাদি সম্পর্কে বিস্তারিত লিখুন..."
                rows={4}
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

        {/* Certificate File Upload */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Award className="size-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">
              সার্টিফিকেট বা সনদপত্র আপলোড (ঐচ্ছিক)
            </span>
          </div>
          <CertificateUpload
            file={certificateFile}
            onFileChange={onCertificateFileChange}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            আপনার সার্ভে বা আমিনশিপ সার্টিফিকেট, প্রশিক্ষণ সনদ বা প্রাতিষ্ঠানিক ডকুমেন্টের কপি (PDF বা ছবি) আপলোড করতে পারেন।
          </p>
        </div>
      </div>
    </div>
  );
}
