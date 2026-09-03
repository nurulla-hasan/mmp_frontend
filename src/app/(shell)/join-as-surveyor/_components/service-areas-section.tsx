"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { MapPin, Plus, Trash2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import type { JoinAsSurveyorFormValues } from "@/validation/join-as-surveyor.schema";

type DistrictOption = { value: string; label: string; upazilas: string[] };

interface ServiceAreasSectionProps {
  districts: DistrictOption[];
}

export function ServiceAreasSection({ districts }: ServiceAreasSectionProps) {
  const { control, setValue, formState: { errors } } = useFormContext<JoinAsSurveyorFormValues>();
  const selectedAreas = useWatch({ control, name: "serviceAreas" }) ?? [];
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const addDistrict = () => {
    if (!selectedDistrict) return;
    const districtObj = districts.find(
      (d) => d.label === selectedDistrict || d.value === selectedDistrict,
    );
    const districtName = districtObj?.label || selectedDistrict;

    if (selectedAreas.some((a) => a.district === districtName)) return;

    setValue(
      "serviceAreas",
      [...selectedAreas, { district: districtName, upazilas: districtObj?.upazilas || [] }],
      { shouldValidate: true },
    );
    setSelectedDistrict("");
  };

  const removeDistrict = (districtName: string) => {
    setValue(
      "serviceAreas",
      selectedAreas.filter((a) => a.district !== districtName),
      { shouldValidate: true },
    );
  };

  const toggleUpazila = (districtName: string, upazilaName: string) => {
    setValue(
      "serviceAreas",
      selectedAreas.map((area) => {
        if (area.district !== districtName) return area;
        const exists = area.upazilas.includes(upazilaName);
        const nextUpazilas = exists
          ? area.upazilas.filter((u) => u !== upazilaName)
          : [...area.upazilas, upazilaName];
        return { ...area, upazilas: nextUpazilas };
      }),
      { shouldValidate: true },
    );
  };

  const toggleAllUpazilas = (districtName: string) => {
    const districtObj = districts.find(
      (d) => d.label === districtName || d.value === districtName,
    );
    if (!districtObj) return;

    setValue(
      "serviceAreas",
      selectedAreas.map((area) => {
        if (area.district !== districtName) return area;
        const allSelected = area.upazilas.length === districtObj.upazilas.length;
        return {
          ...area,
          upazilas: allSelected ? [] : [...districtObj.upazilas],
        };
      }),
      { shouldValidate: true },
    );
  };

  // Available districts not yet added
  const availableDistricts = districts.filter(
    (d) => !selectedAreas.some((a) => a.district === d.label || a.district === d.value),
  );

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <h2 className="font-semibold text-foreground text-sm">
            সেবার এলাকা ও আওতাভুক্ত উপজেলাসমূহ *
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedAreas.length}টি জেলা অন্তর্ভুক্ত
        </span>
      </div>

      <Field data-invalid={!!errors.serviceAreas} className="space-y-4">
        <FieldDescription>
          যে জেলা ও উপজেলাগুলোতে আপনি সরেজমিনে গিয়ে সার্ভে করতে পারবেন সেগুলো যুক্ত করুন।
        </FieldDescription>

        {/* Add District Row */}
        <div className="flex gap-2">
          <Select
            value={selectedDistrict}
            onValueChange={(val) => setSelectedDistrict(val ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="জেলা নির্বাচন করুন..." />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="max-h-60">
              {availableDistricts.map((d) => (
                <SelectItem key={d.value} value={d.label}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={addDistrict}
            disabled={!selectedDistrict}
            className="shrink-0"
          >
            <Plus className="size-4" />
            জেলা যোগ করুন
          </Button>
        </div>

        {/* Added Districts & Upazilas List */}
        {selectedAreas.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            এখনও কোনো সেবার এলাকা যুক্ত করা হয়নি। উপরের ড্রপডাউন থেকে জেলা নির্বাচন করে যোগ করুন।
          </div>
        ) : (
          <div className="space-y-3">
            {selectedAreas.map((area) => {
              const districtObj = districts.find(
                (d) => d.label === area.district || d.value === area.district,
              );
              const totalUpazilas = districtObj?.upazilas || [];
              const allSelected =
                totalUpazilas.length > 0 &&
                area.upazilas.length === totalUpazilas.length;

              return (
                <div
                  key={area.district}
                  className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        📍 {area.district}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({area.upazilas.length}/{totalUpazilas.length}টি উপজেলা)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {totalUpazilas.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleAllUpazilas(area.district)}
                        >
                          {allSelected ? "সব আনচেক" : "সব উপজেলা"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:bg-destructive/10"
                        onClick={() => removeDistrict(area.district)}
                        title="জেলা সরান"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {totalUpazilas.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {totalUpazilas.map((u) => {
                        const isChecked = area.upazilas.includes(u);
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => toggleUpazila(area.district, u)}
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                              isChecked
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-card border text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            {isChecked && <Check className="size-3" />}
                            {u}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      এই জেলার অধীনে কোনো উপজেলা তালিকাভুক্ত নেই।
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {errors.serviceAreas && (
          <FieldError errors={[errors.serviceAreas as unknown as import("react-hook-form").FieldError]} />
        )}
      </Field>
    </div>
  );
}

