"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { FormInput } from "@/components/common/form-input";
import {
  createServiceAction,
  updateServiceAction,
} from "../_actions/service.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TService } from "@/interface/service";

const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  slug: z
    .string()
    .min(2, "Service slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),
  description: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceModal({
  actionType,
  defaultData,
}: {
  actionType: "create" | "edit";
  defaultData?: TService;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = actionType === "edit";

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    mode: "onChange",
    defaultValues: {
      name: defaultData?.name || "",
      slug: defaultData?.slug || "",
      description: defaultData?.description || "",
    },
  });

  async function onSubmit(data: ServiceFormData) {
    const result = isEdit
      ? await updateServiceAction(defaultData!.id, {
          name: data.name.trim(),
          slug: data.slug.trim(),
          description: data.description?.trim() || null,
        })
      : await createServiceAction({
          name: data.name.trim(),
          slug: data.slug.trim(),
          description: data.description?.trim() || null,
        });

    if (result?.success) {
      SuccessToast(
        isEdit
          ? "Service updated successfully"
          : "Service created successfully",
      );
      setOpen(false);
      reset();
    } else {
      ErrorToast(result?.message || "Failed to save service");
    }
  }

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title={isEdit ? "Edit Service" : "Create Service"}
      description={
        isEdit ? `Update "${defaultData?.name}"` : "Add a new service category."
      }
      actionTrigger={
        isEdit ? (
          <Button variant="outline" size="icon" className="size-8">
            <SquarePen className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4 mr-1.5" />
            Add Service
          </Button>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={control}
          name="name"
          label="Service Name"
          placeholder="Enter service name"
        />
        <FormInput
          control={control}
          name="slug"
          label="URL Slug"
          placeholder="Enter service slug (e.g. land-measurement)"
          description="Unique URL identifier for web routes and filters"
        />
        <FormInput
          control={control}
          name="description"
          label="Description"
          type="textarea"
          placeholder="Enter service description (optional)"
        />
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingText={isEdit ? "Updating..." : "Creating..."}
            disabled={!isValid}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
