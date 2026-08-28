import { getMe } from "@/services/auth.service";
import { Navbar } from "./navbar";
import type { TAuthUser } from "@/interface/auth";

// Server Component: reads the session cookie via getMe() so the parent layout
// can stay static. Wrapped in <Suspense> by the layout, this streams in at
// request time while the rest of the page is prerendered as a static shell.
export default async function UserNavbar() {
  let user: TAuthUser | undefined;
  const result = await getMe();
  if (result.success) user = result.data.user;

  return <Navbar user={user} />;
}