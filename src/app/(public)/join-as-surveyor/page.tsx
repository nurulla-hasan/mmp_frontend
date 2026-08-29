import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JoinAsSurveyorForm } from "./_components/join-as-surveyor-form";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { getMe } from "@/services/auth.service";

export const metadata: Metadata = {
  title: "সার্ভেয়ার হিসেবে যোগ দিন — MMP",
  description:
    "MMP প্ল্যাটফর্মে সার্ভেয়ার হিসেবে যোগ দিন। আবেদন ফর্ম পূরণ করে আপনার পেশাদার প্রোফাইল তৈরি করুন এবং নতুন ক্লায়েন্টদের সাথে যুক্ত হন।",
};

export default async function Page() {
  const result = await getMe();
  if (result.success && result.data?.user) {
    if (result.data.user.role === "SURVEYOR" || result.data.user.role === "ADMIN") {
      notFound();
    }
  }

  return (
    <SectionWrapper padding="sm">
      <div className="flex justify-center">
        <JoinAsSurveyorForm />
      </div>
    </SectionWrapper>
  );
}
