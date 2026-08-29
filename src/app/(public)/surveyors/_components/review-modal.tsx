"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { StarRating } from "@/components/common/star-rating";
import type { TSurveyorServiceWithPrice } from "@/interface/surveyor-profile";

const reviewSchema = z.object({
  reviewerName: z.string().min(1, "আপনার নাম লিখুন"),
  rating: z.number().min(1, "রেটিং নির্বাচন করুন"),
  comment: z.string().min(1, "আপনার মন্তব্য লিখুন"),
  serviceName: z.string().min(1, "সার্ভিস নির্বাচন করুন"),
});

type ReviewData = z.infer<typeof reviewSchema>;

export function ReviewModal({
  services,
}: {
  services: TSurveyorServiceWithPrice[];
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<ReviewData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewerName: "",
      rating: 0,
      comment: "",
      serviceName: "",
    },
  });

  function handleFormSubmit(data: ReviewData) {
    console.log("Review submitted:", data);
    form.reset();
    setOpen(false);
  }

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title="রিভিউ লিখুন"
      description="আপনার অভিজ্ঞতা শেয়ার করুন। রিভিউটি এডমিন দ্বারা যাচাইয়ের পর প্রকাশ করা হবে।"
      actionTrigger={
        <Button>
          <MessageCircle className="size-3.5" />
          রিভিউ লিখুন
        </Button>
      }
    >
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-4">
          {/* Reviewer Name */}
          <FormInput
            control={form.control}
            name="reviewerName"
            label="আপনার নাম"
            placeholder="আপনার নাম লিখুন"
          />

          {/* Service */}
          <Controller
            name="serviceName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>কোন সার্ভিস ব্যবহার করেছেন?</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => field.onChange(val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="সার্ভিস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.service.name}>
                        {s.service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Rating */}
          <Controller
            name="rating"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>রেটিং</FieldLabel>
                <div className="mt-1">
                  <StarRating
                    rating={field.value}
                    totalStars={5}
                    onRate={(val) => field.onChange(val)}
                    size={24}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Comment */}
          <Controller
            name="comment"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>আপনার মন্তব্য</FieldLabel>
                <FieldGroup>
                  <Textarea
                    {...field}
                    placeholder="সার্ভেয়ারের কাজ নিয়ে আপনার অভিজ্ঞতা লিখুন..."
                    rows={3}
                    aria-invalid={fieldState.invalid}
                  />
                </FieldGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full">
            রিভিউ জমা দিন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
