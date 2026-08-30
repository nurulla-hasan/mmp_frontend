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
  createBroadcastAction,
  updateBroadcastAction,
} from "../_actions/broadcast.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type {
  TBroadcast,
  TBroadcastTarget,
  TBroadcastType,
} from "@/interface/broadcast";

const broadcastFormSchema = z.object({
  title: z.string().min(2, "Title is required."),
  message: z.string().min(5, "Message must be at least 5 characters."),
  type: z.enum(["INFO", "WARNING", "PROMO", "MAINTENANCE"]).default("INFO"),
  target: z.enum(["ALL", "USERS", "SURVEYORS", "PRO_USERS"]).default("ALL"),
  linkUrl: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isPinned: z.boolean().default(false),
});

interface BroadcastFormValues {
  title: string;
  message: string;
  type: TBroadcastType;
  target: TBroadcastTarget;
  linkUrl?: string | null;
  linkText?: string | null;
  isActive: boolean;
  isPinned: boolean;
}

interface BroadcastFormModalProps {
  broadcast?: TBroadcast;
  trigger?: React.ReactNode;
}

export function BroadcastFormModal({
  broadcast,
  trigger,
}: BroadcastFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!broadcast;

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastFormSchema) as never,
    defaultValues: {
      title: broadcast?.title || "",
      message: broadcast?.message || "",
      type: broadcast?.type || "INFO",
      target: broadcast?.target || "ALL",
      linkUrl: broadcast?.linkUrl || "",
      linkText: broadcast?.linkText || "",
      isActive: broadcast?.isActive ?? true,
      isPinned: broadcast?.isPinned ?? false,
    },
  });

  const onSubmit = (data: BroadcastFormValues) => {
    const payload = {
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type,
      target: data.target,
      linkUrl: data.linkUrl?.trim() || null,
      linkText: data.linkText?.trim() || null,
      isActive: data.isActive,
      isPinned: data.isPinned,
    };

    startTransition(async () => {
      try {
        const res = isEditing
          ? await updateBroadcastAction(broadcast.id, payload)
          : await createBroadcastAction(payload);

        if (res.success) {
          SuccessToast(
            `Broadcast announcement ${isEditing ? "updated" : "published"} successfully.`,
          );
          setOpen(false);
          if (!isEditing) form.reset();
        } else {
          ErrorToast(res.message || "Failed to save announcement.");
        }
      } catch {
        ErrorToast("An error occurred while saving the broadcast.");
      }
    });
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          setOpen(next);
          if (next && broadcast) {
            form.reset({
              title: broadcast.title,
              message: broadcast.message,
              type: broadcast.type,
              target: broadcast.target,
              linkUrl: broadcast.linkUrl || "",
              linkText: broadcast.linkText || "",
              isActive: broadcast.isActive,
              isPinned: broadcast.isPinned,
            });
          }
        }
      }}
      title={isEditing ? "Edit Broadcast Announcement" : "Create Broadcast Announcement"}
      description={
        isEditing
          ? "Update announcement content, target audience, or display settings."
          : "Publish a system notification or announcement to users and surveyors."
      }
      actionTrigger={
        trigger ? (
          trigger
        ) : isEditing ? (
          <Button variant="outline" size="icon" aria-label="Edit broadcast">
            <Edit />
          </Button>
        ) : (
          <Button>
            <Plus />
            New Broadcast
          </Button>
        )
      }
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-h-[75vh] overflow-y-auto px-1"
      >
        {/* Title */}
        <FormInput
          control={form.control}
          name="title"
          label="Announcement Title"
          placeholder="e.g. 🎉 নতুন ফিচার চালু হয়েছে / সিস্টেম মেইনটেনেন্স"
        />

        {/* Row: Type & Target Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Notice Type</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    if (val) field.onChange(val as TBroadcastType);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value="INFO">ℹ️ General Info (তথ্য)</SelectItem>
                    <SelectItem value="PROMO">🎉 Promo / Campaign (ক্যাম্পেইন)</SelectItem>
                    <SelectItem value="WARNING">⚠️ Warning (সতর্কতা)</SelectItem>
                    <SelectItem value="MAINTENANCE">🔧 Maintenance (রক্ষণাবেক্ষণ)</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="target"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Target Audience</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    if (val) field.onChange(val as TBroadcastTarget);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value="ALL">Everyone (সকল ব্যবহারকারী)</SelectItem>
                    <SelectItem value="USERS">General Users (সাধারণ ইউজার)</SelectItem>
                    <SelectItem value="SURVEYORS">Surveyors Only (সার্ভেয়ার)</SelectItem>
                    <SelectItem value="PRO_USERS">Pro Subscribers (পেইড ইউজার)</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Message */}
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Message Content</FieldLabel>
              <FieldGroup>
                <Textarea
                  {...field}
                  placeholder="বিস্তারিত বার্তা লিখুন যা ব্যবহারকারীরা নোটিফিকেশনে দেখতে পাবেন..."
                  rows={4}
                />
              </FieldGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Action Link (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            control={form.control}
            name="linkUrl"
            label="Action Link URL (Optional)"
            placeholder="e.g. /tools or /pricing"
          />
          <FormInput
            control={form.control}
            name="linkText"
            label="Button Label (Optional)"
            placeholder="e.g. বিস্তারিত দেখুন / টুলস ব্যবহার করুন"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-border">
          <Controller
            name="isPinned"
            control={form.control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(!!c)}
                />
                <span>📌 Pin to Top (Highlight announcement)</span>
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
                <span>Active (Visible immediately)</span>
              </label>
            )}
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending
              ? "Publishing..."
              : isEditing
                ? "Update Announcement"
                : "Publish Announcement"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
