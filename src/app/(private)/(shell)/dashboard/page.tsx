import { PageWrapper } from "@/components/ui/custom/page-wrapper";

export default function Page() {
  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold font-heading">ইউজার ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">আপনার জমি-সেবা কার্যক্রমের একটি সংক্ষিপ্ত বিবরণ।</p>
      </div>
    </PageWrapper>
  );
}
