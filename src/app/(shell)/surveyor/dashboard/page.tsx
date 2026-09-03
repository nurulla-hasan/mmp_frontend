import { PageWrapper } from "@/components/common/page-wrapper";

export default function Page() {
  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold font-heading">সার্ভেয়ার ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">আপনার পেশাদার কাজের ওভারভিউ।</p>
      </div>
    </PageWrapper>
  );
}
