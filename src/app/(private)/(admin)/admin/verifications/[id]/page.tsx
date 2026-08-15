import { SectionHeading } from "@/components/common/section-heading";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <SectionHeading
        title="ভেরিফিকেশন রিকোয়েস্ট"
        description={`${id} — জমা দেওয়া আইডেন্টিটি এবং পেশাদার প্রমাণ এখানে দেখাবে।`}
        as="h3"
        alignment="left"
      />
    </div>
  );
}
