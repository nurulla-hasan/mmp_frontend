"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ErrorToast, SuccessToast } from "@/lib/utils";

const formSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "কোডটি ৬ সংখ্যার হতে হবে।"),
});

type ApiResult = { success: boolean; message: string };

function VerifyCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email) {
      ErrorToast("ইমেইল ঠিকানা পাওয়া যায়নি। আবার রেজিস্টার করুন।");
      return;
    }
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        ErrorToast(result.message || "কোড ভেরিফাই করা যায়নি।");
        return;
      }
      SuccessToast("ইমেইল সফলভাবে ভেরিফাই হয়েছে।");
      router.replace("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "কোড ভেরিফাই করা যায়নি।");
    }
  }

  async function resendOtp() {
    if (!email) {
      ErrorToast("ইমেইল ঠিকানা পাওয়া যায়নি।");
      return;
    }
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        ErrorToast(result.message || "নতুন কোড পাঠানো যায়নি।");
        return;
      }
      SuccessToast("নতুন কোড পাঠানো হয়েছে।");
      form.reset();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "নতুন কোড পাঠানো যায়নি।");
    }
  }

  return (
    <form className="w-full max-w-md rounded-xl border bg-card p-6 sm:p-8" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">আপনার ইমেইল ভেরিফাই করুন</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{email || "আপনার ইমেইল"}-এ পাঠানো ৬ সংখ্যার কোডটি লিখুন।</p>
        </div>
        <FieldGroup>
          <Controller
            name="otp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="text-center">ভেরিফিকেশন কোড</FieldLabel>
                <div className="flex justify-center">
                  <InputOTP {...field} maxLength={6} id={field.name} inputMode="numeric" aria-invalid={fieldState.invalid}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((index) => <InputOTPSlot key={index} index={index} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <FieldDescription className="text-center">কোডটির মেয়াদ ৫ মিনিট।</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Field>
            <div className="w-full [&>button]:w-full">
              <Button type="submit" size="lg" loading={form.formState.isSubmitting}>কোড ভেরিফাই করুন</Button>
            </div>
          </Field>
          <Field orientation="horizontal" className="flex-wrap justify-between">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">লগইনে ফিরে যান</Link>
            <button type="button" onClick={resendOtp} className="text-sm text-muted-foreground hover:text-foreground">কোড পুনরায় পাঠান</button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

export default function Page() {
  return <Suspense fallback={null}><VerifyCodeForm /></Suspense>;
}
