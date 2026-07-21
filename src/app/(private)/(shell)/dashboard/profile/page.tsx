import { PageWrapper } from "@/components/ui/custom/page-wrapper";

export default function Page() {
  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading">প্রোফাইল</h1>
          <p className="text-muted-foreground">আপনার অ্যাকাউন্ট আইডেন্টিটি এবং যোগাযোগ পছন্দ পরিচালনা করুন।</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">প্রোফাইল স্ট্যাটাস</p>
            <p className="mt-2 text-2xl font-semibold">প্লেসহোল্ডার</p>
            <p className="mt-2 text-sm text-muted-foreground">ব্যক্তিগত বিবরণ পরবর্তীতে সংযুক্ত হবে।</p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">অ্যাকাউন্ট সেটিংস</p>
            <p className="mt-2 text-sm text-muted-foreground">নিরাপত্তা ও নোটিফিকেশন পছন্দ এখানে দেখাবে।</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
