import { UserShellLayout } from "@/components/layout/user-shell-layout";

export default function StandardToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserShellLayout>{children}</UserShellLayout>;
}

