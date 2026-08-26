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
  email: z.string().email("একটি বৈধ ইমেইল ঠিকানা দিন।"),
  password: z.string().min(1, "পাসওয়ার্ড প্রয়োজন।"),
});

type LoginResult = {
  success: boolean;
  message: string;
  data?: { user: { role: "USER" | "SURVEYOR" | "ADMIN" } };
};

const roleHome = {
  USER: "/dashboard",
  SURVEYOR: "/surveyor/dashboard",
  ADMIN: "/admin/dashboard",
} as const;

export default function Page() {
  const router = useRouter();
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as LoginResult;
      if (!response.ok || !result.data) {
        ErrorToast(result.message || "লগইন করা যায়নি।");
        return;
      }
      SuccessToast("সফলভাবে লগইন হয়েছে।");
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      const safeCallbackUrl = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : null;
      router.replace(safeCallbackUrl || roleHome[result.data.user.role]);
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "লগইন করা যায়নি।");
    }
  }

  return (
    <form className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8" onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">স্বাগতম</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Mouza Map Pro-তে সাইন ইন করুন।</p>
        </div>
        <FieldGroup>
          <FormInput control={control} name="email" label="ইমেইল ঠিকানা" placeholder="you@example.com" type="email" autoComplete="email" />
          <FormInput control={control} name="password" label="পাসওয়ার্ড" placeholder="আপনার পাসওয়ার্ড দিন" type="password" autoComplete="current-password" />
          <Field>
            <div className="w-full [&>button]:w-full"><Button type="submit" size="lg" loading={isSubmitting}>সাইন ইন</Button></div>
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
            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">অ্যাকাউন্ট তৈরি করুন</Link>
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">পাসওয়ার্ড ভুলে গেছেন?</Link>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
