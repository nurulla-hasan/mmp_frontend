"use client";

import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

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
import { SuccessToast, ErrorToast } from "@/lib/utils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [isResending, setIsResending] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    values: {
      email: emailParam,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { rawSeconds, isRunning, start } = useCountdown(60, "reset-otp-timer");

  async function handleResendOtp() {
    const email = form.getValues("email");
    if (!email) {
      ErrorToast("Please provide your email address.");
      return;
    }

    setIsResending(true);
    try {
      const res = await resendResetOtpAction({ email });
      if (!res.success) {
        ErrorToast(res.message || "Failed to resend verification code.");
        return;
      }

      SuccessToast(res.message || "A new code has been sent to your email!");
      start();
    } catch {
      ErrorToast("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(data: ResetPasswordFormValues) {
    try {
      const res = await resetPasswordAction(data);
      if (!res.success) {
        ErrorToast(res.message || "Failed to reset password.");
        return;
      }

      SuccessToast(
        res.message || "Password reset successfully! Please log in with your new password.",
      );
      router.push("/login");
    } catch {
      ErrorToast("An error occurred. Please try again.");
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
            Set New Password
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Enter the 6-digit code sent to your email and your new password.
          </p>
        </div>

        <FieldGroup className="mt-6 space-y-4">
          <FormInput
            control={form.control}
            name="email"
            label="Email Address"
            placeholder="name@example.com"
            type="email"
            autoComplete="email"
          />

          <div className="space-y-1.5">
            <FormInput
              control={form.control}
              name="otp"
              label="6-Digit Verification Code"
              placeholder="123456"
              type="text"
              inputMode="numeric"
              maxLength={6}
            />
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">Didn&apos;t receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isRunning || rawSeconds > 0 || isResending}
                className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
              >
                {isResending ? (
                  "Sending..."
                ) : rawSeconds > 0 ? (
                  `Resend (${rawSeconds}s)`
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>
          </div>

          <FormInput
            control={form.control}
            name="password"
            label="New Password"
            placeholder="Minimum 8 characters"
            type="password"
            autoComplete="new-password"
          />

          <FormInput
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Repeat new password"
            type="password"
            autoComplete="new-password"
          />

          <Field className="pt-2">
            <Button
              type="submit"
              className="w-full font-medium"
              loading={form.formState.isSubmitting}
              loadingText="Resetting Password..."
            >
              <CheckCircle2 />
              Save New Password
            </Button>
          </Field>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Login
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
