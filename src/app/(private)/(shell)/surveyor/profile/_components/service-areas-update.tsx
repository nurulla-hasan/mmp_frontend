/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateMySurveyorProfileAction } from "../_actions/surveyor-profile.action";
import {
  updateServiceAreasSchema,
  type UpdateServiceAreasFormValues,
} from "@/validation/surveyor-profile.schema";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

type DistrictOption = { value: string; label: string; upazilas: string[] };

type ServiceAreasUpdateProps = {
  profile: TSurveyorProfile | null;
  districts: DistrictOption[];
};

const getInitialServiceAreas = (
  profile: TSurveyorProfile | null,
  validDistricts?: DistrictOption[],
) => {
  const areas = (profile?.serviceAreas ?? []).map((a) => ({
    district: a.district,
    upazilas: Array.isArray(a.upazilas) ? a.upazilas : [],
  }));

  if (validDistricts && validDistricts.length > 0) {
    const validValues = new Set(validDistricts.map((d) => d.value));
    return areas.filter((a) => validValues.has(a.district));
  }

  return areas;
};

export function ServiceAreasUpdate({
  profile,
  districts,
}: ServiceAreasUpdateProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateServiceAreasFormValues>({
    resolver: zodResolver(updateServiceAreasSchema as any),
    defaultValues: {
      serviceAreas: getInitialServiceAreas(profile, districts),
    },
  });

  // Sync form state when modal opens or profile/districts change
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      reset({
        serviceAreas: getInitialServiceAreas(profile, districts),
      });
      setError(null);
    } else {
      setError(null);
    }
  };

  const selected = useWatch({ control, name: "serviceAreas" }) ?? [];

  const toggleDistrict = (district: string) => {
    const exists = selected.some((a) => a.district === district);
    if (exists) {
      setValue(
        "serviceAreas",
        selected.filter((a) => a.district !== district),
        { shouldValidate: true },
      );
    } else {
      setValue("serviceAreas", [...selected, { district, upazilas: [] }], {
        shouldValidate: true,
      });
    }
  };

  const toggleUpazila = (district: string, upazila: string) => {
    const area = selected.find((a) => a.district === district);
    if (!area) return;
    const has = area.upazilas.includes(upazila);
    const nextUpazilas = has
      ? area.upazilas.filter((u) => u !== upazila)
      : [...area.upazilas, upazila];
    setValue(
      "serviceAreas",
      selected.map((a) =>
        a.district === district ? { ...a, upazilas: nextUpazilas } : a,
      ),
      { shouldValidate: true },
    );
  };

  const onSubmit = async () => {
    setError(null);
    const values = { serviceAreas: selected } as UpdateServiceAreasFormValues;
    const result = await updateMySurveyorProfileAction(values);
    if (!result.success) {
      setError(result.message ?? "কিছু ভুল হয়েছে।");
      return;
    }
    setOpen(false);
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={handleOpenChange}
      title="সেবার এলাকা আপডেট করুন"
      description="আপনি যে জেলাগুলোতে সেবা দেন নির্বাচন করুন।"
      actionTrigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit service areas"
        >
          <Edit className="size-4" />
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>জেলা নির্বাচন করুন</Label>
          {districts.length === 0 ? (
            <p className="text-sm text-muted-foreground">জেলা লোড হচ্ছে…</p>
          ) : (
            <div className="space-y-3">
              {districts.map((d) => {
                const area = selected.find((a) => a.district === d.value);
                const checked = Boolean(area);
                return (
                  <div
                    key={d.value}
                    className="rounded-md border border-border/60 p-3"
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDistrict(d.value)}
                        className="accent-primary"
                      />
                      {d.label}
                    </label>
                    {checked && d.upazilas.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2 pl-6 sm:grid-cols-3">
                        {d.upazilas.map((u) => {
                          const upChecked = area?.upazilas.includes(u) ?? false;
                          return (
                            <label
                              key={u}
                              className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
                            >
                              <input
                                type="checkbox"
                                checked={upChecked}
                                onChange={() => toggleUpazila(d.value, u)}
                                className="accent-primary"
                              />
                              {u}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {errors.serviceAreas && (
            <p className="text-sm text-destructive">
              {errors.serviceAreas.message as string}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="সংরক্ষণ করা হচ্ছে..."
          >
            সংরক্ষণ করুন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
