"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import {
  surveyorProfileSchema,
  type SurveyorProfileFormValues,
} from "./surveyor-profile.schema";

import { PersonalInfoSection } from "./personal-info-section";
import { ProfessionalInfoSection } from "./professional-info-section";
import { ServiceAreasSection } from "./service-areas-section";
import { WhatsAppSection } from "./whatsapp-section";
import { ServicesSection } from "./services-section";

export function SurveyorProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SurveyorProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(surveyorProfileSchema) as any,
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      headline: "",
      experienceYears: undefined,
      primaryDistrict: "",
      primaryUpazila: "",
      bio: "",
      serviceAreas: [],
      whatsappNumber: "",
      services: [],
    },
  });

  async function onSubmit(data: SurveyorProfileFormValues) {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log("Surveyor profile data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      SuccessToast("প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!");
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

  return (
    <FormProvider {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <PersonalInfoSection />
        <ProfessionalInfoSection />
        <ServiceAreasSection />
        <WhatsAppSection />
        <ServicesSection />

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="size-4" />
                প্রোফাইল সংরক্ষণ
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
