"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { startOfDay } from "date-fns";
import { bn } from "date-fns/locale";

import { PageWrapper } from "@/components/ui/custom/page-wrapper";
import { SectionHeading } from "@/components/home/section-heading";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import CustomCalendar from "@/components/ui/custom/custom-calender";
import { format } from "date-fns";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DISTRICT_OPTIONS,
  SERVICE_OPTIONS,
} from "@/components/join-as-surveyor/schema";

const formSchema = z.object({
  serviceCategoryId: z.string().min(1, "সেবার ধরণ নির্বাচন করুন।"),
  district: z.string().min(1, "জেলা নির্বাচন করুন।"),
  upazila: z.string().min(1, "উপজেলা/থানা নির্বাচন করুন।"),
  description: z
    .string()
    .min(10, "বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে।")
    .max(1000, "বিবরণ ১০০০ অক্ষরের বেশি হতে পারবে না।"),
  landArea: z.coerce
    .number()
    .positive("জমির পরিমাণ ধনাত্মক হতে হবে।")
    .optional(),
  preferredDate: z.string().min(1, "তারিখ নির্বাচন করুন।"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      serviceCategoryId: "",
      district: "",
      upazila: "",
      description: "",
      landArea: undefined,
      preferredDate: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <PageWrapper paddingSize="small" className="space-y-6">
      <SectionHeading
        title="Service Request পোস্ট করুন"
        description="আপনার প্রয়োজনীয় কাজের তথ্য দিন। সার্ভেয়াররা বিস্তারিত দেখে কাজের কোটেশন পাঠাবেন।"
        as="h2"
        alignment="left"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <form
          className="w-full rounded-xl border bg-card p-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldSet>
            <FieldGroup>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Service Category */}
                <Controller
                  name="serviceCategoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>সেবার ধরণ</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v ?? "")}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="সেবার ধরন নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* District */}
                <Controller
                  name="district"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>জেলা</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v ?? "")}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="জেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRICT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Upazila */}
                <Controller
                  name="upazila"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>উপজেলা</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="উপজেলা বা থানার নাম লিখুন"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Land Area */}
                <Controller
                  name="landArea"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        জমির আনুমানিক পরিমাণ (শতক) — ঐচ্ছিক
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        step="any"
                        min={0}
                        aria-invalid={fieldState.invalid}
                        placeholder="যেমন: ৫.২৫"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Preferred Date */}
                <div className="relative">
                  <Controller
                    name="preferredDate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          কাজের সম্ভাব্য তারিখ
                        </FieldLabel>
                        <p className="text-xs text-muted-foreground">
                          এটি আপনার পছন্দের তারিখ; চূড়ান্ত সময় সার্ভেয়ারের
                          সঙ্গে আলোচনা করে নির্ধারিত হবে।
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                          {selectedDate ? (
                            format(selectedDate, "d MMMM yyyy", { locale: bn })
                          ) : (
                            <span className="text-muted-foreground">
                              তারিখ নির্বাচন করুন
                            </span>
                          )}
                        </Button>
                        <input
                          type="hidden"
                          {...field}
                          value={
                            selectedDate
                              ? format(selectedDate, "yyyy-MM-dd")
                              : ""
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  {showCalendar && (
                    <div className="absolute z-50 mt-1 w-full">
                      <CustomCalendar
                        selected={selectedDate}
                        onClose={() => setShowCalendar(false)}
                        disabled={(date) => date < startOfDay(new Date())}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setShowCalendar(false);
                          form.setValue(
                            "preferredDate",
                            date ? format(date, "yyyy-MM-dd") : "",
                          );
                          form.clearErrors("preferredDate");
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>কাজের বিবরণ</FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="min-h-32 resize-y"
                      placeholder="যেমন: আমার ২০ শতক জমির সঠিক পরিমাপ ও সীমানা নির্ধারণ প্রয়োজন। জমিটি দিনাজপুর সদরে অবস্থিত।"
                      rows={5}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Submit */}
              <Field>
                <Button type="submit" size="lg" className="w-full">
                  Service Request পোস্ট করুন
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* How it works */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold text-foreground">কিভাবে কাজ করে</h3>
            <ol className="mt-4 space-y-4">
              {[
                {
                  step: "১",
                  title: "প্রয়োজনীয়তা দিন",
                  desc: "আপনার জমি সংক্রান্ত কাজের বিবরণ ও অবস্থান জানান।",
                },
                {
                  step: "২",
                  title: "কোটেশন পান",
                  desc: "আপনার এলাকার সার্ভেয়াররা বিস্তারিত দেখে মূল্য ও সময় জানাবেন।",
                },
                {
                  step: "৩",
                  title: "সেরাটি বেছে নিন",
                  desc: "একাধিক কোটেশন তুলনা করে আপনার পছন্দের সার্ভেয়ার নির্বাচন করুন।",
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold text-foreground">ভালো বিবরণের টিপস</h3>
            <ul className="mt-3 space-y-2">
              {[
                "জমির সঠিক অবস্থান ও ঠিকানা দিন",
                "প্রয়োজনীয় সেবার ধরন স্পষ্টভাবে উল্লেখ করুন",
                "জমির আনুমানিক পরিমাণ জানালে ভালো",
                "পছন্দের সময়সীমা থাকলে উল্লেখ করুন",
              ].map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary/40" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="rounded-xl border bg-primary/5 p-5">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">৫০+</p>
                <p className="text-xs text-muted-foreground">
                  নিবন্ধিত সার্ভেয়ার
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">১২০+</p>
                <p className="text-xs text-muted-foreground">সফল কাজ</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageWrapper>
  );
}
