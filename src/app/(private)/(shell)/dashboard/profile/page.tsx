import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { ProfileHeaderCard } from "./_components/profile-header-card";
import { PersonalInfoCard } from "./_components/personal-info-card";
import { ActivityCard } from "./_components/activity-card";
import { AccountSettingsCard } from "./_components/account-settings-card";
import { getMe } from "@/services/auth.service";

export default async function Page() {
  const result = await getMe();
  const user = result.success ? result.data.user : null;

  if (!user) {
    return (
      <PageWrapper paddingSize="small">
        <p className="text-sm text-muted-foreground">প্রোফাইল লোড করা যায়নি।</p>
      </PageWrapper>
    );
  }
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
              <ActivityCard />
              <AccountSettingsCard />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
