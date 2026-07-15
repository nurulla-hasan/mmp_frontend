import type { Metadata } from "next";

import { JoinAsSurveyorForm } from "@/components/join-as-surveyor/join-as-surveyor-form";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export const metadata: Metadata = {
  title: "সার্ভেয়ার হিসেবে যোগ দিন — MMP",
  description:
    "MMP প্ল্যাটফর্মে সার্ভেয়ার হিসেবে যোগ দিন। আবেদন ফর্ম পূরণ করে আপনার পেশাদার প্রোফাইল তৈরি করুন এবং নতুন ক্লায়েন্টদের সাথে যুক্ত হন।",
};

export default function Page() {
  return (
    <SectionWrapper padding="sm">
      <div className="flex justify-center">
        <JoinAsSurveyorForm />
      </div>
    </SectionWrapper>
  );
}
