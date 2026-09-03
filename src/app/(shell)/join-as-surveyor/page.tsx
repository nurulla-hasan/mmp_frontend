import type { Metadata } from "next";

import { JoinAsSurveyorForm } from "./_components/join-as-surveyor-form";
import { ApplicationStatusView } from "./_components/application-status-view";
import { getMe } from "@/services/auth.service";
import { getDistricts } from "@/services/district.service";
import { getServices } from "@/services/service.service";
import { PageWrapper } from "@/components/common/page-wrapper";

export const metadata: Metadata = {
  title: "সার্ভেয়ার হিসেবে যোগ দিন — Mouza Map Pro",
  description:
    "Mouza Map Pro প্ল্যাটফর্মে সার্ভেয়ার হিসেবে যোগ দিন। আবেদন ফর্ম পূরণ করে আপনার পেশাদার প্রোফাইল তৈরি করুন এবং নতুন ক্লায়েন্টদের সাথে যুক্ত হন।",
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

  const existingProfile = user?.surveyorProfile;

  return (
    <PageWrapper paddingSize="small">
      {existingProfile ? (
        <ApplicationStatusView profile={existingProfile} />
      ) : (
        <JoinAsSurveyorForm
          isAuthenticated={isAuthenticated}
          user={user}
          districts={districts}
          services={services}
        />
      )}
    </PageWrapper>
  );
}
