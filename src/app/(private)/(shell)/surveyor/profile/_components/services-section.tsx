"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldDescription } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SERVICE_OPTIONS } from "@/validation/join-as-surveyor.schema";
import type { SurveyorProfileFormValues } from "@/validation/surveyor-profile.schema";
import { X } from "lucide-react";

export function ServicesSection() {
  const { control } = useFormContext<SurveyorProfileFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const selectedSlugs = fields.map((f) => f.slug);
  const availableServices = SERVICE_OPTIONS.filter(
    (opt) => !selectedSlugs.includes(opt.value),
  );

  return (
    <>
      {/* ── Selected services ── */}
      <Card>
        <CardHeader>
          <CardTitle>আপনার সেবাসমূহ</CardTitle>
          <FieldDescription>
            আপনি যেসব সেবা প্রদান করেন, প্রতিটির জন্য প্রারম্ভিক মূল্য দিন।
          </FieldDescription>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              এখনো কোনো সেবা যোগ করেননি। নিচের তালিকা থেকে সেবা নির্বাচন করুন।
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((service, index) => (
                <div
                  key={service.id}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{service.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">৳</span>
                      <Controller
                        name={`services.${index}.startingPrice`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type="number"
                              min={0}
                              step={100}
                              placeholder="মূল্য"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      aria-label={`${service.name} সরান`}
                      onClick={() => remove(index)}
                    >
                    <X />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add services ── */}
      {availableServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>সেবা যোগ করুন</CardTitle>
            <FieldDescription>
              নিচের তালিকা থেকে আপনার পছন্দের সেবা নির্বাচন করুন।
            </FieldDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableServices.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      slug: opt.value,
                      name: opt.label,
                      startingPrice: null,
                    })
                  }
                >
                  <span className="text-lg leading-none">+</span>
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
