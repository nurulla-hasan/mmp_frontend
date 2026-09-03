"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMeAction } from "../_actions/surveyor-profile.action";
import { updateMeSchema, type UpdateMeFormValues } from "@/validation/update-me.schema";
import type { TAuthUser } from "@/interface/auth";

type DistrictOption = { value: string; label: string; upazilas: string[] };

type PersonalInfoUpdateProps = {
  user: TAuthUser | null;
  districts: DistrictOption[];
};

export function PersonalInfoUpdate({ user, districts }: PersonalInfoUpdateProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<UpdateMeFormValues>({
    resolver: zodResolver(updateMeSchema),
    values: {
      name: user?.name ?? "",
      imageUrl: user?.imageUrl ?? "",
      phone: user?.phone ?? "",
      whatsappNumber: user?.whatsappNumber ?? "",
      district: user?.district ?? "",
      upazila: user?.upazila ?? "",
    },
  });

  const selectedDistrict = useWatch({ control, name: "district" });
  const districtObj = districts.find((d) => d.label === selectedDistrict || d.value === selectedDistrict);
  const availableUpazilas = districtObj?.upazilas ?? [];

  const onSubmit = async (values: UpdateMeFormValues) => {
    setError(null);
    const cleanedValues = {
      name: values.name?.trim() || undefined,
      imageUrl: values.imageUrl?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      whatsappNumber: values.whatsappNumber?.trim() || undefined,
      district: values.district?.trim() || undefined,
      upazila: values.upazila?.trim() || undefined,
    };
    const result = await updateMeAction(cleanedValues);
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
      title="ব্যক্তিগত ও অবস্থান তথ্য আপডেট করুন"
      description="আপনার নাম, যোগাযোগ ও প্রধান অবস্থান (জেলা/উপজেলা) আপডেট করুন।"
      actionTrigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit personal info"
        >
          <Edit />
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={control}
          name="imageUrl"
          label="প্রোফাইল ছবির লিংক (Image URL)"
          placeholder="https://example.com/photo.jpg"
        />

        <FormInput
          control={control}
          name="name"
          label="পূর্ণ নাম"
          placeholder="আপনার নাম"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput
            control={control}
            name="phone"
            label="ফোন নম্বর"
            placeholder="01XXXXXXXXX"
          />
          <FormInput
            control={control}
            name="whatsappNumber"
            label="হোয়াটসঅ্যাপ নম্বর"
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            name="district"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>জেলা</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("upazila", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="জেলা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {districts.map((d) => (
                      <SelectItem key={d.value} value={d.label}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="upazila"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>উপজেলা / থানা</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={!selectedDistrict || availableUpazilas.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedDistrict
                          ? "আগে জেলা নির্বাচন করুন"
                          : availableUpazilas.length === 0
                            ? "কোনো উপজেলা নেই"
                            : "উপজেলা নির্বাচন করুন"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {availableUpazilas.map((upazila) => (
                      <SelectItem key={upazila} value={upazila}>
                        {upazila}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t">
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
            loadingText="আপডেট হচ্ছে..."
          >
            আপডেট করুন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
