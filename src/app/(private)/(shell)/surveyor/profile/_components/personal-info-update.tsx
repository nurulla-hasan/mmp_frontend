"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import { updateMeAction } from "../_actions/surveyor-profile.action";
import { updateMeSchema, type UpdateMeFormValues } from "@/validation/update-me.schema";
import type { TAuthUser } from "@/interface/auth";

type PersonalInfoUpdateProps = {
  user: TAuthUser | null;
};

export function PersonalInfoUpdate({ user }: PersonalInfoUpdateProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateMeFormValues>({
    resolver: zodResolver(updateMeSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      whatsappNumber: user?.whatsappNumber ?? "",
    },
  });

  const onSubmit = async (values: UpdateMeFormValues) => {
    setError(null);
    const result = await updateMeAction(values);
    if (!result.success) {
      setError(result.message ?? "কিছু ভুল হয়েছে।");
      return;
    }
    setOpen(false);
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title="ব্যক্তিগত তথ্য আপডেট করুন"
      description="আপনার নাম, মোবাইল ও WhatsApp নম্বর আপডেট করুন।"
      actionTrigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit personal info"
        >
          <Edit className="size-4" />
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={control}
          name="name"
          label="পূর্ণ নাম"
          placeholder="আপনার নাম লিখুন"
        />
        <FormInput
          control={control}
          name="phone"
          label="মোবাইল নম্বর"
          placeholder="01XXXXXXXXX"
          type="tel"
        />
        <FormInput
          control={control}
          name="whatsappNumber"
          label="WhatsApp নম্বর"
          placeholder="01XXXXXXXXX"
          type="tel"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            বাতিল
          </Button>
          <Button type="submit" loading={isSubmitting} loadingText="সংরক্ষণ করা হচ্ছে...">
            সংরক্ষণ করুন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
