import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { PageWrapper } from "@/components/common/page-wrapper";
// import { SectionHeading } from "@/components/common/section-heading";
import { getMe } from "@/services/auth.service";
import { getDistricts } from "@/services/district.service";
import { ProfileHeaderCard } from "@/app/(shell)/(private)/dashboard/profile/_components/profile-header-card";
import { PersonalInfoCard } from "@/app/(shell)/(private)/dashboard/profile/_components/personal-info-card";
import { AccountSettingsCard } from "@/app/(shell)/(private)/dashboard/profile/_components/account-settings-card";
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
        <p className="text-sm text-muted-foreground">Unable to load profile.</p>
      </PageWrapper>
    );
  }

  const isSuper = user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
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
                    <span>System Permissions & Access</span>
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
                    <span>User & Subscription Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Surveyor Verification & Approvals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span>Review Moderation & Broadcast Notices</span>
                  </div>
                  {isSuper && (
                    <div className="flex items-center gap-2">
                      <Lock className="size-3.5 text-purple-600 shrink-0" />
                      <span className="font-medium text-foreground">
                        Full access to create and manage administrators
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

