import { PublicFooter } from "@/components/layout/public-footer";
import UserMobileBottomNav from "@/components/common/user-mobile-bottom-nav";
import { Suspense } from "react";
import UserNavbar from "@/components/layout/navbar/user-navbar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <UserNavbar />
      </Suspense>
      <div className="pb-14 lg:pb-0">
        {children}
        <PublicFooter />
      </div>
      <Suspense fallback={null}>
        <UserMobileBottomNav />
      </Suspense>
    </>
  );
}
