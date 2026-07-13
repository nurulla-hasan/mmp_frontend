import { DashboardShell } from "@/components/layout/dashboard-shell";
export default function SurveyorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="surveyor">{children}</DashboardShell>;
}
