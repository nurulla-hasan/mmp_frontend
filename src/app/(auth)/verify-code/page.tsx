"use client";

import { Suspense, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { useCountdown } from "@/hooks/useUtilityHooks";
import { resendOtpAction, verifyEmailAction } from "../_actions/auth.action";

const formSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "কোডটি ৬ সংখ্যার হতে হবে।"),
});

function VerifyCodeForm() {
  const email = useSearchParams().get("email") ?? "";
  const { rawSeconds, isRunning, start } = useCountdown(
    60,
    `verify-otp-${email}`,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    // Start countdown on first visit if not running
    if (!isRunning && rawSeconds === 60) {
      start();
    }
  }, [isRunning, rawSeconds, start]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email) {
      ErrorToast("ইমেইল ঠিকানা পাওয়া যায়নি। আবার রেজিস্টার করুন।");
      return;
    }
    const result = await verifyEmailAction({ email, otp: data.otp });
    if (!result.success) {
      ErrorToast(result.message || "কোড ভেরিফাই করা যায়নি।");
    }
  }

  async function resendOtp() {
    if (!email) {
      ErrorToast("ইমেইল ঠিকানা পাওয়া যায়নি।");
      return;
    }
    const result = await resendOtpAction({ email });
    if (!result.success) {
      ErrorToast(result.message || "নতুন কোড পাঠানো যায়নি।");
      return;
    }
    SuccessToast("নতুন কোড পাঠানো হয়েছে।");
    form.reset();
    start();
  }

  return (
    <form
      className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            আপনার ইমেইল ভেরিফাই করুন
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">
              {email || "আপনার ইমেইল"}
            </span>
            -এ পাঠানো ৬ সংখ্যার কোডটি লিখুন।
          </p>
        </div>

        <FieldGroup className="mt-6 space-y-4">
          <Controller
            name="otp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name} className="text-center block">
                  ভেরিফিকেশন কোড
                </FieldLabel>
                <div className="flex justify-center my-2">
                  <InputOTP
                    {...field}
                    maxLength={6}
                    id={field.name}
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <FieldDescription className="text-center text-xs">
                  কোডটির মেয়াদ ৫ মিনিট।
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={form.formState.isSubmitting}
            >
              কোড ভেরিফাই করুন
            </Button>
          </Field>

          <Field orientation="horizontal" className="flex-wrap justify-between text-xs sm:text-sm pt-2">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              লগইনে ফিরে যান
            </Link>
            <button
              type="button"
              onClick={resendOtp}
              disabled={isRunning || rawSeconds > 0}
              className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
            >
              {rawSeconds > 0
                ? `পুনরায় কোড পাঠান (${rawSeconds}s)`
                : "কোড পুনরায় পাঠান"}
            </button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={null}>
      <VerifyCodeForm />
    </Suspense>
  );
}
