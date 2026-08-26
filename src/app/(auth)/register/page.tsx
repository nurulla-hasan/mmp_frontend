"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormInput } from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldSeparator, FieldSet } from "@/components/ui/field";
import { ErrorToast, SuccessToast } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
  email: z.string().email("একটি বৈধ ইমেইল ঠিকানা দিন।"),
  password: z.string().min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"),
});

type RegisterResult = { success: boolean; message: string; data?: { email: string } };

export default function Page() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as RegisterResult;
      if (!response.ok || !result.data?.email) {
        ErrorToast(result.message || "অ্যাকাউন্ট তৈরি করা যায়নি।");
        return;
      }
      SuccessToast("ভেরিফিকেশন কোড পাঠানো হয়েছে।");
      router.replace(`/verify-code?email=${encodeURIComponent(result.data.email)}`);
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "অ্যাকাউন্ট তৈরি করা যায়নি।");
    }
  }

  return (
    <form className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">আপনার অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">জমি-সেবা কার্যক্রম পরিচালনার জন্য সাধারণ ব্যবহারকারী হিসেবে নিবন্ধন করুন।</p>
        </div>
        <FieldGroup>
          <FormInput control={form.control} name="name" label="পূর্ণ নাম" placeholder="আপনার পূর্ণ নাম দিন" autoComplete="name" />
          <FormInput control={form.control} name="email" label="ইমেইল ঠিকানা" placeholder="you@example.com" type="email" autoComplete="email" />
          <FormInput control={form.control} name="password" label="পাসওয়ার্ড" placeholder="আপনার পাসওয়ার্ড দিন" type="password" autoComplete="new-password" />
          <Field>
            <div className="w-full [&>button]:w-full"><Button type="submit" size="lg" loading={form.formState.isSubmitting}>অ্যাকাউন্ট তৈরি করুন</Button></div>
          </Field>
          <FieldSeparator>অথবা</FieldSeparator>
          <Field>
            <div className="w-full [&>button]:w-full">
              <Button type="button" variant="outline" size="lg" onClick={() => { window.location.href = "/api/auth/google"; }}>
                Google দিয়ে চালিয়ে যান
              </Button>
            </div>
          </Field>
          <Field orientation="horizontal" className="flex-wrap justify-between">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">ইতিমধ্যে অ্যাকাউন্ট আছে?</Link>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
