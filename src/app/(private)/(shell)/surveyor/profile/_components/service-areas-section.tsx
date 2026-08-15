"use client";

import { Globe } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldDescription } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DISTRICT_OPTIONS } from "@/validation/join-as-surveyor.schema";
import type { SurveyorProfileFormValues } from "@/validation/surveyor-profile.schema";

export function ServiceAreasSection() {
  const { control } = useFormContext<SurveyorProfileFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-5 text-primary" />
          সেবার এলাকা
        </CardTitle>
        <FieldDescription>
          আপনি যে জেলাগুলোতে সেবা প্রদান করেন সেগুলো নির্বাচন করুন।
        </FieldDescription>
      </CardHeader>
      <CardContent>
        <Controller
          name="serviceAreas"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {DISTRICT_OPTIONS.map((opt) => {
                  const isChecked = field.value.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors select-none hover:bg-muted/50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
                      data-checked={isChecked || undefined}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...field.value, opt.value]
                            : field.value.filter((v: string) => v !== opt.value);
                          field.onChange(next);
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
}
