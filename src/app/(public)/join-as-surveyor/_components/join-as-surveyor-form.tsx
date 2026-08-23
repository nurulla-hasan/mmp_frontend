"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import { formSchema, type FormValues } from "./schema";

import { PersonalInfoSection } from "./personal-info-section";
import { ServicesSection } from "./services-section";

export function JoinAsSurveyorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      district: "",
      upazila: "",
      address: "",
      experience: undefined,
      nidFront: undefined,
      nidBack: undefined,
      profileImage: undefined,
      certificate: undefined,
      services: [],
      serviceAreas: [],
      bio: "",
      terms: false,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log("Surveyor application data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      SuccessToast("আপনার আবেদন সফলভাবে জমা হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।");
      form.reset();
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form
        className="w-full rounded-xl border bg-card p-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldSet>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              সার্ভেয়ার হিসেবে আবেদন করুন
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              আপনার পেশাগত তথ্য পূরণ করুন। Admin review ও verification-এর পরে আপনার public profile প্রকাশ করা হবে।
            </p>
          </div>

          <FieldGroup>
            <div className="grid gap-6 lg:grid-cols-2">
              <PersonalInfoSection />
              <ServicesSection />
            </div>

            <Controller
              name="terms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      আমি নিশ্চিত করছি যে আমার দেওয়া তথ্য সঠিক এবং verification-এর জন্য review করা যেতে পারে।
                    </span>
                  </label>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    আবেদন জমা দিন
                  </>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
