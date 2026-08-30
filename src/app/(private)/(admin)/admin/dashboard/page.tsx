import {
  Calculator,
  CreditCard,
  Megaphone,
  Ruler,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
} from "lucide-react";

import { getAdminDashboardStats } from "@/services/admin-dashboard.service";
import { SectionHeading } from "@/components/common/section-heading";
import { DataTable } from "@/components/common/data-table";
import { StatCard } from "./_components/stat-card";
import { PendingAlerts } from "./_components/pending-alerts";
import { GrowthChart } from "./_components/growth-chart";
import { DistrictDistribution } from "./_components/district-distribution";
import {
  activityColumns,
  type ActivityRow,
} from "./_components/activity-column";

export default async function AdminDashboardPage() {
  const res = await getAdminDashboardStats();
  const data = res.success ? res.data : null;

  const overview = data?.overview || {
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalSurveyors: 0,
    verifiedSurveyors: 0,
    pendingVerifications: 0,
    totalSubscribers: 0,
    totalRevenue: 0,
    totalCalculations: 0,
    totalReviews: 0,
    pendingReviews: 0,
    activeBroadcasts: 0,
  };

  const charts = data?.charts || {
    monthlyGrowth: [],
    topDistricts: [],
    planShare: [],
  };

  const activities: ActivityRow[] = (data?.recentActivities || []).map((a) => ({
    id: a.id,
    type: a.type,
    title: a.title,
    description: a.description,
    user: a.user,
    status: a.status,
    createdAt: a.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeading
        title="Admin Overview"
        description="Real-time performance metrics, platform growth analytics, and verification queues."
        as="h3"
        alignment="left"
        constrain={false}
      />

      {/* Pending Action Banners (if any) */}
      <PendingAlerts
        pendingVerifications={overview.pendingVerifications}
        pendingReviews={overview.pendingReviews}
      />

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Users */}
        <StatCard
          title="Total Users"
          value={overview.totalUsers}
          description={`${overview.activeUsers} active · ${overview.blockedUsers} blocked accounts`}
          icon={Users}
          badgeText="Users"
          badgeVariant="outline"
        />

        {/* 2. Certified Surveyors */}
        <StatCard
          title="Certified Surveyors"
          value={overview.verifiedSurveyors}
          description={`${overview.totalSurveyors} total registered · ${overview.pendingVerifications} pending`}
          icon={ShieldCheck}
          badgeText={overview.pendingVerifications > 0 ? `${overview.pendingVerifications} Pending` : "Verified"}
          badgeVariant={overview.pendingVerifications > 0 ? "pending" : "active"}
        />

        {/* 3. Pro Subscribers */}
        <StatCard
          title="Pro Subscribers"
          value={overview.totalSubscribers}
          description="Active paid & campaign subscribers"
          icon={UserCheck}
          badgeText="Active Pro"
          badgeVariant="progress"
        />

        {/* 4. Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={`৳${overview.totalRevenue.toLocaleString()}`}
          description="Lifetime platform subscription volume"
          icon={CreditCard}
          badgeText="BDT"
          badgeVariant="active"
        />

        {/* 5. Calculations Run */}
        <StatCard
          title="Calculations Run"
          value={overview.totalCalculations}
          description="Land measurements & conversion tools"
          icon={Ruler}
          badgeText="Tools"
          badgeVariant="info"
        />

        {/* 6. Customer Reviews */}
        <StatCard
          title="Customer Reviews"
          value={overview.totalReviews}
          description={`${overview.pendingReviews} pending moderation`}
          icon={Star}
          badgeText={overview.pendingReviews > 0 ? `${overview.pendingReviews} Pending` : "Published"}
          badgeVariant={overview.pendingReviews > 0 ? "pending" : "active"}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GrowthChart data={charts.monthlyGrowth} />
        <DistrictDistribution
          districts={charts.topDistricts}
          totalSurveyors={overview.totalSurveyors}
        />
      </div>

      {/* Recent Live Activity Feed */}
      <div className="space-y-3">
        <SectionHeading
          title="Recent Platform Activity"
          description="Latest live events, user registrations, verifications, and subscription payments."
          as="h4"
          alignment="left"
          constrain={false}
        />
        <DataTable
          data={activities}
          columns={activityColumns}
        />
      </div>
    </div>
  );
}
