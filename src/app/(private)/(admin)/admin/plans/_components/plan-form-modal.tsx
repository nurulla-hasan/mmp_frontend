"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { FormInput } from "@/components/common/form-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPlanAction,
  updatePlanAction,
} from "../_actions/plan.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TPlan, TPlanBillingCycle } from "@/interface/plan";

const planFormSchema = z.object({
  name: z.string().min(2, "Plan name is required."),
  code: z.string().min(2, "Plan code is required (e.g. pro_monthly)."),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0, "Price must be >= 0."),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
  discountBadge: z.string().optional().nullable(),
  durationDays: z.coerce.number().int().positive("Duration must be > 0.").default(30),
  billingCycle: z.enum(["MONTHLY", "SIX_MONTHS", "YEARLY", "LIFETIME", "CUSTOM"]).default("MONTHLY"),
  featuresText: z.string().optional().default(""),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

interface PlanFormValues {
  name: string;
  code: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  discountBadge?: string | null;
  durationDays: number;
  billingCycle: TPlanBillingCycle;
  featuresText: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface PlanFormModalProps {
  plan?: TPlan;
  trigger?: React.ReactNode;
}

export function PlanFormModal({ plan, trigger }: PlanFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!plan;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema) as never,
    defaultValues: {
      name: plan?.name || "",
      code: plan?.code || "",
      description: plan?.description || "",
      price: plan?.price ?? 299,
      originalPrice: plan?.originalPrice ?? undefined,
      discountBadge: plan?.discountBadge || "",
      durationDays: plan?.durationDays ?? 30,
      billingCycle: plan?.billingCycle || "MONTHLY",
      featuresText: plan?.features?.join("\n") || "",
      isPopular: plan?.isPopular ?? false,
      isActive: plan?.isActive ?? true,
      sortOrder: plan?.sortOrder ?? 0,
    },
  });

  const onSubmit = (data: PlanFormValues) => {
    const features = data.featuresText
      ? data.featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean)
      : [];

    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toLowerCase(),
      description: data.description.trim(),
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      discountBadge: data.discountBadge?.trim() || null,
      durationDays: Number(data.durationDays),
      billingCycle: data.billingCycle,
      features,
      isPopular: data.isPopular,
      isActive: data.isActive,
      sortOrder: Number(data.sortOrder),
    };

    startTransition(async () => {
      try {
        const res = isEditing
          ? await updatePlanAction(plan.id, payload)
          : await createPlanAction(payload);

        if (res.success) {
          SuccessToast(
            `Plan "${data.name}" ${isEditing ? "updated" : "created"} successfully.`,
          );
          setOpen(false);
          if (!isEditing) form.reset();
        } else {
          ErrorToast(res.message || "Failed to save plan.");
        }
      } catch {
        ErrorToast("An error occurred while saving the plan.");
      }
    });
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          setOpen(next);
          if (next && plan) {
            form.reset({
              name: plan.name,
              code: plan.code,
              description: plan.description || "",
              price: plan.price,
              originalPrice: plan.originalPrice ?? undefined,
              discountBadge: plan.discountBadge || "",
              durationDays: plan.durationDays,
              billingCycle: plan.billingCycle,
              featuresText: plan.features?.join("\n") || "",
              isPopular: plan.isPopular,
              isActive: plan.isActive,
              sortOrder: plan.sortOrder,
            });
          }
        }
      }}
      title={isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}
      description={
        isEditing
          ? "Update pricing, duration, and feature list for this plan."
          : "Define a new pricing package for Mouza Map Pro users."
      }
      actionTrigger={
        trigger ? (
          trigger
        ) : isEditing ? (
          <Button
            variant="outline"
            size="icon"
            aria-label="Edit plan"
          >
            <Edit  />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Add Plan
          </Button>
        )
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Row 1: Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            control={form.control}
            name="name"
            label="Plan Name"
            placeholder="e.g. Pro Monthly"
          />
          <FormInput
            control={form.control}
            name="code"
            label="Plan Code / Slug"
            placeholder="e.g. pro_monthly"
          />
        </div>

        {/* Row 2: Price, Original Price, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormInput
            control={form.control}
            name="price"
            label="Price (৳ BDT)"
            type="number"
            placeholder="299"
          />
          <FormInput
            control={form.control}
            name="originalPrice"
            label="Original Price (৳)"
            type="number"
            placeholder="399 (optional)"
          />
          <FormInput
            control={form.control}
            name="durationDays"
            label="Duration (Days)"
            type="number"
            placeholder="30"
          />
        </div>

        {/* Row 3: Billing Cycle, Discount Badge, Display Order */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Controller
            name="billingCycle"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Billing Cycle</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val as TPlanBillingCycle)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value="MONTHLY">Monthly (1 Month)</SelectItem>
                    <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
                    <SelectItem value="YEARLY">Yearly (1 Year)</SelectItem>
                    <SelectItem value="LIFETIME">Lifetime</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <FormInput
            control={form.control}
            name="discountBadge"
            label="Discount Badge"
            placeholder="e.g. Save 33%, Best Value"
          />

          <FormInput
            control={form.control}
            name="sortOrder"
            label="Display Order"
            type="number"
            placeholder="1"
          />
        </div>

        {/* Row 4: Description */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Short Description</FieldLabel>
              <FieldGroup>
                <Textarea
                  {...field}
                  placeholder="Brief summary of what this plan is best suited for..."
                  rows={2}
                />
              </FieldGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Row 5: Features (1 per line) */}
        <Controller
          name="featuresText"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Plan Features (1 feature per line)</FieldLabel>
              <FieldGroup>
                <Textarea
                  {...field}
                  placeholder={"Unlimited access to all Pro tools\nLand measurement & Pantagraph tools\nUnlimited PDF & PNG report exports\n24/7 Priority support"}
                  rows={4}
                />
              </FieldGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Row 6: Popular & Active Toggles */}
        <div className="flex flex-col sm:flex-row gap-4 pt-1 border-t border-border">
          <Controller
            name="isPopular"
            control={form.control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(!!c)}
                />
                <span>Highlight as Popular Plan ⭐</span>
              </label>
            )}
          />

          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(!!c)}
                />
                <span>Active Plan (Available for purchase)</span>
              </label>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending
              ? "Saving..."
              : isEditing
                ? "Update Plan"
                : "Create Plan"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
