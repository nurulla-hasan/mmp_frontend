"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">কিছু সমস্যা হয়েছে</h1>
      <p className="mt-3 text-muted-foreground">এই পৃষ্ঠাটি লোড করা যায়নি। আবার চেষ্টা করুন।</p>
      <Button className="mt-6" onClick={reset}>আবার চেষ্টা করুন</Button>
    </main>
  );
}
