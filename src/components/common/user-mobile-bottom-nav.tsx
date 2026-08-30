import { getMe } from "@/services/auth.service";
import { MobileBottomNav } from "./mobile-bottom-nav";
import type { TAuthUser } from "@/interface/auth";

export default async function UserMobileBottomNav() {
  let user: TAuthUser | undefined;
  const result = await getMe();
  if (result.success) user = result.data.user;

  return <MobileBottomNav user={user} />;
}

