"use client";

import { BookOpen, Briefcase, MapPin } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DISTRICT_OPTIONS } from "@/validation/join-as-surveyor.schema";
import type { SurveyorProfileFormValues } from "@/validation/surveyor-profile.schema";

export function ProfessionalInfoSection() {
  const { control } = useFormContext<SurveyorProfileFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="size-5 text-primary" />
          পেশাগত তথ্য
        </CardTitle>
        <FieldDescription>
          আপনার পেশাগত অভিজ্ঞতা ও কর্মক্ষেত্র সম্পর্কে তথ্য।
        </FieldDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* ── Experience ── */}
          <Controller
            name="experienceYears"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  <BookOpen className="size-3.5" />
                  অভিজ্ঞতা (বছর)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  max={50}
                  aria-invalid={fieldState.invalid}
                  placeholder="যেমন: ১০"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ── Primary District ── */}
          <Controller
            name="primaryDistrict"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  <MapPin className="size-3.5" />
                  প্রধান অবস্থান (জেলা)
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? "")}
                >
                  <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {DISTRICT_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>আপনার প্রধান কর্মক্ষেত্র।</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ── Primary Upazila ── */}
          <Controller
            name="primaryUpazila"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>উপজেলা/থানা</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="যেমন: বিরামপুর"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ── Bio ── */}
          <Controller
            name="bio"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                <FieldLabel htmlFor={field.name}>সম্পর্কে</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                  placeholder="আপনার পেশাগত অভিজ্ঞতা, দক্ষতা ইত্যাদি সংক্ষেপে লিখুন..."
                  rows={4}
                  maxLength={500}
                />
                <FieldDescription>
                  সর্বোচ্চ ৫০০ অক্ষর।
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
