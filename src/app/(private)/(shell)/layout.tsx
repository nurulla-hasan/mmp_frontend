import { Suspense } from "react";
import { PublicFooter } from "@/components/layout/public-footer";
import UserMobileBottomNav from "@/components/common/user-mobile-bottom-nav";
import UserNavbar from "@/components/layout/navbar/user-navbar";
import { Navbar } from "@/components/layout/navbar/navbar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<Navbar />}>
        <UserNavbar />
      </Suspense>
      <div className="pb-14 lg:pb-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
      <Suspense fallback={null}>
        <UserMobileBottomNav />
      </Suspense>
    </>
  );
}
