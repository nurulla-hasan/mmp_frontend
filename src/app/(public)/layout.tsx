import { PublicFooter } from "@/components/layout/public-footer";
import { Navbar } from "@/components/layout/navbar/navbar";
import { MobileBottomNav } from "@/components/common/mobile-bottom-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="pb-14 lg:pb-0">
        {children}
      <PublicFooter />
      </div>
      <MobileBottomNav />
    </>
  );
}
