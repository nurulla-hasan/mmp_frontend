"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel, FieldDescription } from "@/components/ui/field";
import { SERVICE_OPTIONS, DISTRICT_OPTIONS, type FormValues } from "./schema";

export function ServicesSection() {
  const { control } = useFormContext<FormValues>();

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm font-medium text-primary">সেবা সমূহ</p>

      <div className="mt-5 space-y-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
        <Controller
          name="services"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="lg:col-span-2">
              <FieldLabel>সেবার ধরন</FieldLabel>
              <FieldDescription>
                আপনি যে সেবাগুলো প্রদান করেন সেগুলো নির্বাচন করুন।
              </FieldDescription>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SERVICE_OPTIONS.map((opt) => {
                  const isChecked = field.value.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors select-none hover:bg-muted/50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...field.value, opt.value]
                            : field.value.filter(
                                (v: string) => v !== opt.value
                              );
                          field.onChange(next);
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="serviceAreas"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="lg:col-span-2">
              <FieldLabel>সেবার এলাকা</FieldLabel>
              <FieldDescription>
                আপনি যে জেলাগুলোতে সেবা প্রদান করেন সেগুলো নির্বাচন করুন।
              </FieldDescription>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {DISTRICT_OPTIONS.map((opt) => {
                  const isChecked = field.value.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors select-none hover:bg-muted/50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...field.value, opt.value]
                            : field.value.filter(
                                (v: string) => v !== opt.value
                              );
                          field.onChange(next);
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="lg:col-span-2">
              <FieldLabel htmlFor={field.name}>পূর্ণ ঠিকানা</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="গ্রাম, ওয়ার্ড, পোস্ট অফিস সহ পূর্ণ ঠিকানা"
                rows={3}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="bio"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="lg:col-span-2">
              <FieldLabel htmlFor={field.name}>
                সংক্ষিপ্ত পরিচিতি (ঐচ্ছিক)
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="আপনার পেশাগত অভিজ্ঞতা, দক্ষতা ইত্যাদি সংক্ষেপে লিখুন..."
                rows={4}
              />
              <FieldDescription>সর্বোচ্চ ৫০০ অক্ষর।</FieldDescription>
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
