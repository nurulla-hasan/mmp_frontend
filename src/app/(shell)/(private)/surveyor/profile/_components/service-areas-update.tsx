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
  const areas = (profile?.serviceAreas ?? []).map((a) => {
    const match = validDistricts?.find(
      (d) => d.value === a.district || d.label === a.district,
    );
    return {
      district: match?.label ?? a.district,
      upazilas: Array.isArray(a.upazilas) ? a.upazilas : [],
    };
  });

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
    formState: { errors, isSubmitting },
  } = useForm<UpdateServiceAreasFormValues>({
    resolver: zodResolver(updateServiceAreasSchema as any),
    values: {
      serviceAreas: getInitialServiceAreas(profile, districts),
    },
  });

  const selected = useWatch({ control, name: "serviceAreas" }) ?? [];

  const toggleDistrict = (district: string) => {
    const exists = selected.some(
      (a) => a.district === district,
    );
    if (exists) {
      setValue(
        "serviceAreas",
        selected.filter((a) => a.district !== district),
        { shouldValidate: true },
      );
    } else {
      const match = districts.find(
        (d) => d.label === district || d.value === district,
      );
      setValue(
        "serviceAreas",
        [
          ...selected,
          {
            district: match?.label ?? district,
            upazilas: match?.upazilas ?? [],
          },
        ],
        { shouldValidate: true },
      );
    }
  };

  const toggleUpazila = (district: string, upazila: string) => {
    const current = selected.find((a) => a.district === district);
    if (!current) return;

    const currentUpazilas = Array.isArray(current.upazilas)
      ? current.upazilas
      : [];
    const exists = currentUpazilas.includes(upazila);

    const updatedUpazilas = exists
      ? currentUpazilas.filter((u) => u !== upazila)
      : [...currentUpazilas, upazila];

    setValue(
      "serviceAreas",
      selected.map((a) =>
        a.district === district ? { ...a, upazilas: updatedUpazilas } : a,
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
      onOpenChange={setOpen}
      title="সেবার এলাকা আপডেট করুন"
      description="আপনি যে জেলাগুলোতে সেবা দেন নির্বাচন করুন।"
      actionTrigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit service areas"
        >
          <Edit />
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
                const area = selected.find(
                  (a) => a.district === d.label || a.district === d.value,
                );
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
                        onChange={() => toggleDistrict(d.label)}
                        className="accent-primary"
                      />
                      {d.label}
                    </label>
                    {checked && d.upazilas.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2 pl-6 sm:grid-cols-3">
                        {d.upazilas.map((u) => {
                          const uChecked = area?.upazilas?.includes(u) ?? false;
                          return (
                            <label
                              key={u}
                              className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground"
                            >
                              <input
                                type="checkbox"
                                checked={uChecked}
                                onChange={() => toggleUpazila(d.label, u)}
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
              {errors.serviceAreas.message}
            </p>
          )}
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
