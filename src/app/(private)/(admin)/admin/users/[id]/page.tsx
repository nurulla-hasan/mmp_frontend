import { SectionHeading } from "@/components/common/section-heading";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <SectionHeading
        title="User"
        description={`${id} — Account details, status, and platform activity will appear here.`}
        as="h3"
        alignment="left"
      />
    </div>
  );
}
