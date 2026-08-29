import type { Metadata } from "next";

import { JoinAsSurveyorForm } from "./_components/join-as-surveyor-form";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { getMe, getDistricts, getServices } from "@/services/auth.service";

export const metadata: Metadata = {
  title: "সার্ভেয়ার হিসেবে যোগ দিন — MMP",
  description:
    "MMP প্ল্যাটফর্মে সার্ভেয়ার হিসেবে যোগ দিন। আবেদন ফর্ম পূরণ করে আপনার পেশাদার প্রোফাইল তৈরি করুন এবং নতুন ক্লায়েন্টদের সাথে যুক্ত হন।",
};

export default async function Page() {
  const [meResult, districtsResult, servicesResult] = await Promise.all([
    getMe(),
    getDistricts(),
    getServices(),
  ]);

  const user = meResult.success ? meResult.data.user : undefined;
  const isAuthenticated = Boolean(user);
  const districts = districtsResult.success ? (districtsResult.data ?? []) : [];
  const services = servicesResult.success ? (servicesResult.data ?? []) : [];

  return (
    <SectionWrapper padding="sm">
        <JoinAsSurveyorForm
          isAuthenticated={isAuthenticated}
          user={user}
          districts={districts}
          services={services}
        />
    </SectionWrapper>
  );
}
