import { UserShellLayout } from "@/components/layout/user-shell-layout";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserShellLayout>{children}</UserShellLayout>;
}
