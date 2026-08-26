import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { ProfileHeaderCard } from "./_components/profile-header-card";
import { PersonalInfoCard } from "./_components/personal-info-card";
import { ActivityCard } from "./_components/activity-card";
import { AccountSettingsCard } from "./_components/account-settings-card";
import type { TAuthUser } from "@/interface/auth";

// TODO: replace with nextServerFetch("/auth/me", { auth: "auth" })
const user: TAuthUser = {
  id: "1",
  name: "রহিম উদ্দিন",
  email: "rahim@example.com",
  role: "USER",
  isSubscribed: true,
  phone: "০১৭১২৩৪৫৬৭৮",
  whatsappNumber: "০১৭১২৩৪৫৬৭৮",
  location: { district: "ঢাকা", upazila: "সাভার" },
  joinedAt: "2025-01-15T10:00:00.000Z",
  savedCalculationsCount: 3,
  savedSurveyorsCount: 5,
};

export default function Page() {
  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-6">
        <SectionHeading
          as="h3"
          title="প্রোফাইল"
          description="আপনার অ্যাকাউন্ট আইডেন্টিটি এবং যোগাযোগ পছন্দ পরিচালনা করুন।"
          alignment="left"
          constrain={false}
        />

        {/* Modern 2-Column Dashboard Profile Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: User Identity & Profile Summary */}
          <div className="lg:col-span-4">
            <ProfileHeaderCard user={user} />
          </div>

          {/* Right Column: Detailed Personal Info & Activities */}
          <div className="space-y-6 lg:col-span-8">
            <PersonalInfoCard user={user} />
            <div className="grid gap-6 sm:grid-cols-2">
              <ActivityCard user={user} />
              <AccountSettingsCard />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
