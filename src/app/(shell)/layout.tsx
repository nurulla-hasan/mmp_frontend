import { UserShellLayout } from "@/components/layout/user-shell-layout";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserShellLayout>{children}</UserShellLayout>;
}
