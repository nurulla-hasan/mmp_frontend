"use client";

import { Suspense, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { FormInput } from "@/components/common/form-input";
import { useCountdown } from "@/hooks/useUtilityHooks";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/validation/forgot-password.schema";
import {
  resendResetOtpAction,
  resetPasswordAction,
} from "../_actions/auth.action";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailParam,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { rawSeconds, isRunning, start } = useCountdown(60, "reset-otp-timer");

  useEffect(() => {
    if (emailParam) {
      form.setValue("email", emailParam);
    }
  }, [emailParam, form]);

  async function handleResendOtp() {
    const email = form.getValues("email");
    if (!email) {
      toast.error("অনুগ্রহ করে ইমেইল ঠিকানা দিন।");
      return;
    }

    setIsResending(true);
    try {
      const res = await resendResetOtpAction({ email });
      if (!res.success) {
        toast.error(res.message || "কোড পুনরায় পাঠানো যায়নি।");
        return;
      }

      toast.success(res.message || "নতুন কোড আপনার ইমেইলে পাঠানো হয়েছে!");
      start();
    } catch {
      toast.error("একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।");
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsSubmitting(true);
    try {
      const res = await resetPasswordAction(data);
      if (!res.success) {
        toast.error(res.message || "পাসওয়ার্ড রিসেট করা যায়নি।");
        return;
      }

      toast.success(
        res.message || "পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এখন লগইন করুন।",
      );
      router.push("/login");
    } catch {
      toast.error("একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            নতুন পাসওয়ার্ড সেট করুন
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            আপনার ইমেইলে পাঠানো ৬-ডিজিটের কোড ও নতুন পাসওয়ার্ড প্রদান করুন।
          </p>
        </div>

        <FieldGroup className="mt-6 space-y-4">
          <FormInput
            control={form.control}
            name="email"
            label="ইমেইল ঠিকানা"
            placeholder="name@example.com"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
          />

          <div className="space-y-1.5">
            <FormInput
              control={form.control}
              name="otp"
              label="৬-ডিজিট ভেরিফিকেশন কোড"
              placeholder="123456"
              type="text"
              inputMode="numeric"
              maxLength={6}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">কোড পাননি?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isRunning || rawSeconds > 0 || isResending}
                className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
              >
                {isResending ? (
                  "পাঠানো হচ্ছে..."
                ) : rawSeconds > 0 ? (
                  `পুনরায় পাঠান (${rawSeconds}s)`
                ) : (
                  "পুনরায় কোড পাঠান"
                )}
              </button>
            </div>
          </div>

          <FormInput
            control={form.control}
            name="password"
            label="নতুন পাসওয়ার্ড"
            placeholder="কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          <FormInput
            control={form.control}
            name="confirmPassword"
            label="পাসওয়ার্ড নিশ্চিত করুন"
            placeholder="পুনরায় পাসওয়ার্ড লিখুন"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          <Field className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  রিসেট করা হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  পাসওয়ার্ড সংরক্ষণ করুন
                </>
              )}
            </Button>
          </Field>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              লগইন পেজে ফিরে যান
            </Link>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
