import { PublicDynamicPage } from "@/components/shared/dynamic-page";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PublicDynamicPage
      label="কমিউনিটি প্রশ্ন"
      value={slug}
      description="প্রশ্নের বিবরণ, ভেরিফাইড সার্ভেয়ার উত্তর, ভোটিং এবং মডারেশন প্লেসহোল্ডার এখানে থাকবে।"
    />
  );
}
