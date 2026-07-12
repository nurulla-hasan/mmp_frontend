import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { MobileBottomNav } from "@/components/ui/custom/mobile-bottom-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <PublicFooter />
      <MobileBottomNav />
    </>
  );
}
