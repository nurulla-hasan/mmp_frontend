 
"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMySurveyorProfileAction } from "../_actions/surveyor-profile.action";
import { updateServicesSchema, type UpdateServicesFormValues } from "@/validation/surveyor-profile.schema";
import type { TSurveyorProfile, TSurveyorService } from "@/interface/surveyor-profile";

type ServicesUpdateProps = {
  profile: TSurveyorProfile | null;
  services: TSurveyorService[];
};

export function ServicesUpdate({
  profile,
  services,
}: ServicesUpdateProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentServices = profile?.surveyorServices ?? [];

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateServicesFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateServicesSchema as any),
    defaultValues: {
      services: currentServices.map((s) => ({
        serviceId: s.serviceId,
        slug: s.service.slug,
        name: s.service.name,
        startingPrice: s.startingPrice ?? 0,
      })),
    },
  });

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
            slug: service.slug,
            name: service.name,
            startingPrice: 0,
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

  const onSubmit = async () => {
    setError(null);
    const values = { services: selected } as UpdateServicesFormValues;
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
      title="আপনার সেবাসমূহ আপডেট করুন"
      description="সেবা নির্বাচন করুন ও প্রতিটির শুরুর মূল্য দিন।"
      actionTrigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit services"
        >
          <Edit className="size-4" />
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-3">
          <Label>সেবা নির্বাচন করুন</Label>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
          ) : (
            services.map((service) => {
              const found = selected.find((s) => s.serviceId === service.id);
              return (
                <div
                  key={service.id}
                  className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(found)}
                    onChange={() => toggleService(service)}
                    className="accent-primary"
                  />
                  <span className="flex-1 text-sm">{service.name}</span>
                  {found && (
                    <Input
                      type="number"
                      placeholder="মূল্য"
                      className="w-28"
                      value={found.startingPrice ?? 0}
                      onChange={(e) =>
                        updatePrice(service.id, Number(e.target.value))
                      }
                    />
                  )}
                </div>
              );
            })
          )}
          {errors.services && (
            <p className="text-sm text-destructive">
              {errors.services.message as string}
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
          <Button type="submit" loading={isSubmitting} loadingText="সংরক্ষণ করা হচ্ছে...">
            সংরক্ষণ করুন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
