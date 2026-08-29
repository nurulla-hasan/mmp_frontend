"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Wrench, CheckCircle2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import type { TSurveyorService } from "@/interface/surveyor-profile";
import type { JoinAsSurveyorFormValues } from "@/validation/join-as-surveyor.schema";

interface ServicesSectionProps {
  services: TSurveyorService[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const { control, setValue, formState: { errors } } = useFormContext<JoinAsSurveyorFormValues>();
  const selected = useWatch({ control, name: "services" }) ?? [];

  const toggleService = (service: TSurveyorService) => {
    const exists = selected.some((s) => s.serviceId === service.id);
    if (exists) {
      setValue(
        "services",
        selected.filter((s) => s.serviceId !== service.id),
        { shouldValidate: true },
      );
    } else {
      setValue(
        "services",
        [
          ...selected,
          {
            serviceId: service.id,
            name: service.name,
            startingPrice: 1000,
          },
        ],
        { shouldValidate: true },
      );
    }
  };

  const updatePrice = (serviceId: string, price: number) => {
    setValue(
      "services",
      selected.map((s) =>
        s.serviceId === serviceId ? { ...s, startingPrice: price } : s,
      ),
      { shouldValidate: true },
    );
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-primary" />
          <h2 className="font-semibold text-foreground text-sm">
            প্রদেয় সেবাসমূহ ও প্রারম্ভিক ফি *
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {selected.length}টি সেবা নির্বাচিত
        </span>
      </div>

      <Field data-invalid={!!errors.services} className="space-y-3">
        <FieldDescription>
          আপনি যে সেবাগুলো প্রদান করেন সেগুলো টিক দিন এবং ক্লায়েন্টের জন্য প্রারম্ভিক ফি (৳) উল্লেখ করুন।
        </FieldDescription>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {services.map((service) => {
            const found = selected.find((s) => s.serviceId === service.id);
            const isChecked = Boolean(found);

            return (
              <div
                key={service.id}
                className={`flex flex-col justify-between rounded-lg border p-3 transition-all ${
                  isChecked
                    ? "border-primary/50 bg-primary/5 shadow-xs"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <div
                  onClick={() => toggleService(service)}
                  className="flex cursor-pointer items-start gap-3 select-none"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleService(service)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {service.name}
                    </p>
                    {service.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                {isChecked && (
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      শুরুর মূল্য (৳):
                    </span>
                    <div className="relative w-28">
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        placeholder="৳ মূল্য"
                        className="h-8 text-right text-xs font-medium"
                        value={found?.startingPrice ?? ""}
                        onChange={(e) =>
                          updatePrice(
                            service.id,
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {errors.services && (
          <FieldError errors={[errors.services as unknown as import("react-hook-form").FieldError]} />
        )}
      </Field>
    </div>
  );
}
