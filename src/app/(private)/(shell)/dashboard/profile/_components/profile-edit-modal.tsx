"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Copy,
  Edit,
} from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfileAction } from "../_actions/profile.action";
import {
  updateMeSchema,
  type UpdateMeFormValues,
} from "@/validation/update-me.schema";
import { SuccessToast, ErrorToast, getInitials } from "@/lib/utils";
import type { TAuthUser } from "@/interface/auth";

type DistrictOption = { value: string; label: string; upazilas: string[] };

interface ProfileEditModalProps {
  user: TAuthUser;
  districts: DistrictOption[];
  trigger?: React.ReactNode;
}

export function ProfileEditModal({
  user,
  districts,
  trigger,
}: ProfileEditModalProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<UpdateMeFormValues>({
    resolver: zodResolver(updateMeSchema),
    defaultValues: {
      name: user.name ?? "",
      imageUrl: user.imageUrl ?? "",
      phone: user.phone ?? "",
      whatsappNumber: user.whatsappNumber ?? "",
      district: user.district ?? "",
      upazila: user.upazila ?? "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      reset({
        name: user.name ?? "",
        imageUrl: user.imageUrl ?? "",
        phone: user.phone ?? "",
        whatsappNumber: user.whatsappNumber ?? "",
        district: user.district ?? "",
        upazila: user.upazila ?? "",
      });
    }
  };

  const watchedImageUrl = useWatch({ control, name: "imageUrl" });
  const watchedName = useWatch({ control, name: "name" });
  const watchedPhone = useWatch({ control, name: "phone" });
  const selectedDistrict = useWatch({ control, name: "district" });

  const districtObj = districts.find(
    (d) => d.label === selectedDistrict || d.value === selectedDistrict,
  );
  const availableUpazilas = districtObj?.upazilas ?? [];

  const copyPhoneToWhatsapp = () => {
    if (watchedPhone) {
      setValue("whatsappNumber", watchedPhone.trim(), { shouldValidate: true });
    }
  };

  const onSubmit = async (values: UpdateMeFormValues) => {
    try {
      const cleanedValues: UpdateMeFormValues = {
        name: values.name?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        whatsappNumber: values.whatsappNumber?.trim() || undefined,
        district: values.district?.trim() || undefined,
        upazila: values.upazila?.trim() || undefined,
      };

      const result = await updateProfileAction(cleanedValues);
      if (result.success) {
        SuccessToast("প্রোফাইল সফলভাবে আপডেট করা হয়েছে।");
        setOpen(false);
      } else {
        ErrorToast(result.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
      }
    } catch {
      ErrorToast("কিছু ভুল হয়েছে, পরে আবার চেষ্টা করুন।");
    }
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={handleOpenChange}
      title="প্রোফাইল সম্পাদনা"
      description="আপনার ব্যক্তিগত পরিচয়, যোগাযোগের নম্বর ও এলাকা আপডেট করুন।"
      actionTrigger={
        trigger || (
          <Button variant="outline" size="sm" className="w-full">
            <Edit />
            <span>প্রোফাইল এডিট</span>
          </Button>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 1. Avatar Preview & Image URL */}
        <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-muted/30 p-3.5">
          <Avatar size="lg" isPro={user.isSubscribed} className="shrink-0">
            <AvatarImage
              src={watchedImageUrl || user.imageUrl}
              alt={watchedName || user.name}
            />
            <AvatarFallback className="text-base">
              {getInitials(watchedName || user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <FormInput
              control={control}
              name="imageUrl"
              label="প্রোফাইল ছবির লিংক (Image URL)"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        {/* 2. Full Name */}
        <FormInput
          control={control}
          name="name"
          label="পূর্ণ নাম"
          placeholder="আপনার নাম লিখুন"
        />

        {/* 3. Phone & WhatsApp row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            control={control}
            name="phone"
            label="মোবাইল নম্বর"
            placeholder="01XXXXXXXXX"
          />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                WhatsApp নম্বর
              </span>
              {watchedPhone && (
                <button
                  type="button"
                  onClick={copyPhoneToWhatsapp}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="size-2.5" />
                  <span>নম্বর কপি করুন</span>
                </button>
              )}
            </div>
            <FormInput
              control={control}
              name="whatsappNumber"
              label=""
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        {/* 4. District & Upazila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* District Select */}
          <Controller
            control={control}
            name="district"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error} className="gap-1.5">
                <FieldLabel className="text-xs font-medium">জেলা</FieldLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("upazila", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {districts.map((d) => (
                      <SelectItem key={d.value} value={d.label}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Upazila Select */}
          <Controller
            control={control}
            name="upazila"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error} className="gap-1.5">
                <FieldLabel className="text-xs font-medium">উপজেলা</FieldLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={!selectedDistrict || availableUpazilas.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedDistrict
                          ? "আগে জেলা নির্বাচন করুন"
                          : availableUpazilas.length === 0
                            ? "কোনো উপজেলা পাওয়া যায়নি"
                            : "উপজেলা নির্বাচন করুন"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {availableUpazilas.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </div>

        {/* Modal Actions */}
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
            loadingText="সংরক্ষণ হচ্ছে..."
          >
            <Check />
            সংরক্ষণ করুন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

