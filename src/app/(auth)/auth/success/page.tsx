import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { decodeJwtPayload } from "@/lib/jwt";

export default async function GoogleLoginSuccessPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login?error=google_auth_failed");
  }

  const user = decodeJwtPayload(accessToken);

  if (!user) {
    redirect("/login?error=google_auth_failed");
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/");
}
