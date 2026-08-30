import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { PageWrapper } from "@/components/common/page-wrapper";
// import { SectionHeading } from "@/components/common/section-heading";
import { getMe, getDistricts } from "@/services/auth.service";
import { ProfileHeaderCard } from "@/app/(private)/(shell)/dashboard/profile/_components/profile-header-card";
import { PersonalInfoCard } from "@/app/(private)/(shell)/dashboard/profile/_components/personal-info-card";
import { AccountSettingsCard } from "@/app/(private)/(shell)/dashboard/profile/_components/account-settings-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminProfilePage() {
  const [meResult, districtsResult] = await Promise.all([
    getMe(),
    getDistricts(),
  ]);

  const user = meResult.success ? meResult.data.user : null;
  const districts = districtsResult.success ? districtsResult.data : [];

  if (!user) {
    return (
      <PageWrapper paddingSize="small">
        <p className="text-sm text-muted-foreground">প্রোফাইল লোড করা যায়নি।</p>
      </PageWrapper>
    );
  }

  const isSuper = user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* <SectionHeading
        title="অ্যাডমিনিস্ট্রেটর প্রোফাইল"
        description="আপনার প্রশাসনিক অ্যাকাউন্ট আইডেন্টিটি, ব্যক্তিগত তথ্য এবং নিরাপত্তা পছন্দসমূহ পরিচালনা করুন।"
        as="h3"
        alignment="left"
        constrain={false}
      /> */}

      {/* 2-Column Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Admin Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileHeaderCard user={user} districts={districts} />
        </div>

        {/* Right Column: Personal Info, Security & Privileges */}
        <div className="space-y-6 lg:col-span-8">
          <PersonalInfoCard user={user} districts={districts} />

          <div className="grid gap-6 sm:grid-cols-2">
            {/* 1. Account Settings & Password Change */}
            <AccountSettingsCard user={user} />

            {/* 2. Admin Privileges Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    {isSuper ? (
                      <ShieldAlert className="size-4 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <ShieldCheck className="size-4 text-primary" />
                    )}
                    <span>সিস্টেম পারমিশন ও এক্সেস</span>
                  </CardTitle>
                  <Badge variant={isSuper ? "admin" : "manager"}>
                    {isSuper ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>ইউজার ও সাবস্ক্রিপশন ব্যবস্থাপনা</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>সার্ভেয়ার ভেরিফিকেশন ও অনুমোদন</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>রিভিউ মডারেশন ও ব্রডকাস্ট নোটিস</span>
                  </div>
                  {isSuper && (
                    <div className="flex items-center gap-2">
                      <Lock className="size-3.5 text-purple-600 shrink-0" />
                      <span className="font-medium text-foreground">
                        অ্যাডমিন তৈরি ও ডিলিট করার পূর্ণ এক্সেস
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

