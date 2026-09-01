"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { FormInput } from "@/components/common/form-input";
import { createAdminAction } from "../_actions/admin.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";

const adminSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^01[3-9]\d{8}$/.test(val),
      "Phone number must be an 11-digit Bangladeshi number (e.g. 017XXXXXXXX).",
    ),
});

type AdminFormData = z.infer<typeof adminSchema>;

export function AdminModal({
  actionTrigger,
}: {
  actionTrigger?: ReactNode;
} = {}) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  async function onSubmit(data: AdminFormData) {
    const result = await createAdminAction({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      phone: data.phone?.trim() || null,
    });

    if (result?.success) {
      SuccessToast("New Administrator created successfully");
      setOpen(false);
      reset();
    } else {
      ErrorToast(result?.message || "Failed to create administrator");
    }
  }

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title="Create New Admin"
      description="Create a new administrator account with full platform administrative privileges."
      actionTrigger={
        actionTrigger || (
          <Button className="w-full sm:w-auto">
            <Plus className="size-4 mr-1.5" />
            Add Admin
          </Button>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <FormInput
          control={control}
          name="name"
          label="Full Name"
          placeholder="e.g. Asif Rahman"
        />

        {/* Email Address */}
        <FormInput
          control={control}
          name="email"
          label="Email Address"
          placeholder="e.g. admin@mouzamaappro.com"
        />

        {/* Password */}
        <FormInput
          control={control}
          name="password"
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
        />

        {/* Phone Number (Optional 11-digit) */}
        <FormInput
          control={control}
          name="phone"
          label="Phone Number"
          placeholder="e.g. 01712345678"
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
            loadingText="Creating..."
            disabled={!isValid}
          >
            Create Admin
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
