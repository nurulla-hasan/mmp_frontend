"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck } from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import { changePasswordAction } from "../_actions/profile.action";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/validation/change-password.schema";
import { SuccessToast, ErrorToast } from "@/lib/utils";

interface ChangePasswordModalProps {
  hasPassword?: boolean;
  trigger?: React.ReactNode;
}

export function ChangePasswordModal({
  hasPassword = true,
  trigger,
}: ChangePasswordModalProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const payload: ChangePasswordFormValues = {
        oldPassword: hasPassword ? values.oldPassword?.trim() : undefined,
        newPassword: values.newPassword.trim(),
        confirmPassword: values.confirmPassword.trim(),
      };

      const result = await changePasswordAction(payload);
      if (result.success) {
        SuccessToast(
          hasPassword
            ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।"
            : "পাসওয়ার্ড সফলভাবে সেট করা হয়েছে।",
        );
        setOpen(false);
        reset();
      } else {
        ErrorToast(result.message || "পাসওয়ার্ড আপডেট ব্যর্থ হয়েছে।");
      }
    } catch {
      ErrorToast("কিছু ভুল হয়েছে, পরে আবার চেষ্টা করুন।");
    }
  };

  const title = hasPassword ? "পাসওয়ার্ড পরিবর্তন" : "পাসওয়ার্ড সেট করুন";
  const description = hasPassword
    ? "আপনার অ্যাকাউন্টের সুরক্ষার জন্য শক্তিশালী ও নিরাপদ পাসওয়ার্ড ব্যবহার করুন।"
    : "আপনার গুগল অ্যাকাউন্টের সাথে একটি পাসওয়ার্ড যুক্ত করুন যাতে পরবর্তীতে ইমেইল ও পাসওয়ার্ড উভয় দিয়েই লগইন করতে পারেন।";

  return (
    <ModalWrapper
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      actionTrigger={
        trigger || (
          <Button variant="outline" size="sm">
            {hasPassword ? "পরিবর্তন" : "সেট করুন"}
          </Button>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 1. Current Password (only if user already has a password) */}
        {hasPassword && (
          <FormInput
            control={control}
            name="oldPassword"
            label="বর্তমান পাসওয়ার্ড"
            type="password"
            placeholder="বর্তমান পাসওয়ার্ড লিখুন"
            autoComplete="current-password"
          />
        )}

        {/* 2. New Password */}
        <FormInput
          control={control}
          name="newPassword"
          label={hasPassword ? "নতুন পাসওয়ার্ড" : "পাসওয়ার্ড"}
          type="password"
          placeholder="কমপক্ষে ৮ অক্ষরের নতুন পাসওয়ার্ড"
          autoComplete="new-password"
        />

        {/* 3. Confirm Password */}
        <FormInput
          control={control}
          name="confirmPassword"
          label="নতুন পাসওয়ার্ড নিশ্চিত করুন"
          type="password"
          placeholder="নতুন পাসওয়ার্ডটি আবার লিখুন"
          autoComplete="new-password"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingText={hasPassword ? "পরিবর্তন হচ্ছে..." : "সংরক্ষণ হচ্ছে..."}
          >
            <ShieldCheck />
            {hasPassword ? "পাসওয়ার্ড পরিবর্তন করুন" : "পাসওয়ার্ড সেট করুন"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
