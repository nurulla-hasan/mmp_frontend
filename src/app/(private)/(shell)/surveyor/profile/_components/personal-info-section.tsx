"use client";

import { User, Phone } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SurveyorProfileFormValues } from "@/validation/surveyor-profile.schema";

export function PersonalInfoSection() {
  const { control } = useFormContext<SurveyorProfileFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5 text-primary" />
          ব্যক্তিগত তথ্য
        </CardTitle>
        <FieldDescription>
          আপনার মৌলিক পরিচয় ও যোগাযোগের তথ্য। ইমেইল ছাড়া সবকিছু
          পরিবর্তনযোগ্য।
        </FieldDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* ── Profile Photo ── */}
          <div className="sm:col-span-2">
            <FieldLabel>প্রোফাইল ছবি</FieldLabel>
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <User className="size-8" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="cursor-not-allowed rounded-lg border bg-muted px-4 py-2 text-sm text-muted-foreground">
                  <span>ছবি যোগ করুন</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Full Name ── */}
          <Controller
            name="fullName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>পূর্ণ নাম</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="আপনার পুরো নাম"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ── Phone ── */}
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  <Phone className="size-3.5" />
                  মোবাইল নম্বর
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="tel"
                  aria-invalid={fieldState.invalid}
                  placeholder="01XXXXXXXXX"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ── Email (read-only) ── */}
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>ইমেইল</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  readOnly
                  className="cursor-not-allowed opacity-60"
                  tabIndex={-1}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>ইমেইল পরিবর্তন করা যাবে না।</FieldDescription>
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
