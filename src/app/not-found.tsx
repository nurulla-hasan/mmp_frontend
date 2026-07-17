import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold">পৃষ্ঠাটি পাওয়া যায়নি</h1>
      <p className="mt-3 text-muted-foreground">পৃষ্ঠাটি সম্ভবত সরানো হয়েছে বা ঠিকানাটি ভুল।</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button nativeButton={false} render={<Link href="/" />}>হোমপেজ</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/tools" />}>ল্যান্ড টুলস</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/surveyors" />}>সার্ভেয়ার খুঁজুন</Button>
      </div>
    </main>
  );
}
