"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { FormInput } from "@/components/common/form-input";
import {
  createDistrictAction,
  updateDistrictAction,
} from "../_actions/district.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TDistrict } from "@/interface/district";

const districtSchema = z.object({
  name: z.string().min(2, "District name is required"),
  slug: z
    .string()
    .min(2, "District slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),
});

type DistrictFormData = z.infer<typeof districtSchema>;

export function DistrictModal({
  actionType,
  defaultData,
}: {
  actionType: "create" | "edit";
  defaultData?: TDistrict;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = actionType === "edit";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
    mode: "onChange",
    values: {
      name: defaultData?.name || "",
      slug: defaultData?.slug || "",
    },
  });

  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, setValue]);

  async function onSubmit(data: DistrictFormData) {
    const result = isEdit
      ? await updateDistrictAction(defaultData!.id, {
          name: data.name.trim(),
          slug: data.slug.trim(),
        })
      : await createDistrictAction({
          name: data.name.trim(),
          slug: data.slug.trim(),
        });

    if (result?.success) {
      SuccessToast(
        isEdit
          ? "District updated successfully"
          : "District created successfully",
      );
      setOpen(false);
      reset();
    } else {
      ErrorToast(result?.message || "Failed to save district");
    }
  }

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title={isEdit ? "Edit District" : "Create District"}
      description={
        isEdit
          ? `Update "${defaultData?.name}" district details.`
          : "Add a new district to the service coverage catalog."
      }
      actionTrigger={
        isEdit ? (
          <Button variant="outline" size="icon" aria-label="Edit District">
            <SquarePen className="size-4" />
          </Button>
        ) : (
          <Button className="w-full sm:w-auto">
            <Plus className="size-4" />
            Add District
          </Button>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={control}
          name="name"
          label="District Name"
          placeholder="e.g. Dhaka, Chittagong, Sylhet"
        />

        <FormInput
          control={control}
          name="slug"
          label="URL Slug"
          placeholder="e.g. dhaka, chittagong, sylhet"
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
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            loadingText={isEdit ? "Saving..." : "Creating..."}
          >
            {isEdit ? "Save Changes" : "Create District"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

