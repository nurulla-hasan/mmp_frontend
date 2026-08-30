"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { LogIn, MessageCircle, ShieldAlert, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalWrapper } from "@/components/common/modal-wrapper";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/common/star-rating";
import { createReviewAction } from "../_actions/review.action";
import { SuccessToast, ErrorToast, getInitials } from "@/lib/utils";
import type { TSurveyorServiceWithPrice } from "@/interface/surveyor-profile";
import type { TAuthUser } from "@/interface/auth";

const reviewSchema = z.object({
  rating: z.number().min(1, "রেটিং নির্বাচন করুন"),
  comment: z.string().min(5, "আপনার মন্তব্য অন্তত ৫ অক্ষরে লিখুন"),
  serviceName: z.string().min(1, "সার্ভিস নির্বাচন করুন"),
});

type ReviewData = z.infer<typeof reviewSchema>;

export function ReviewModal({
  surveyorProfileId,
  surveyorSlug,
  services,
  currentUser,
}: {
  surveyorProfileId?: string;
  surveyorSlug?: string;
  services: TSurveyorServiceWithPrice[];
  currentUser?: TAuthUser | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReviewData>({
    resolver: zodResolver(reviewSchema),
    mode: "onChange",
    defaultValues: {
      rating: 0,
      comment: "",
      serviceName: "",
    },
  });

  // 1. If user is NOT logged in, show Auth Gate Modal
  if (!currentUser) {
    const callbackUrl = surveyorSlug ? `/surveyors/${surveyorSlug}` : "/surveyors";
    return (
      <ModalWrapper
        open={open}
        onOpenChange={setOpen}
        title="রিভিউ দিতে লগইন করুন"
        description="সার্ভেয়ারের কাজের গুণগত মান বজায় রাখতে ও স্প্যাম মুক্ত রাখতে শুধুমাত্র রেজিস্টার্ড ব্যবহারকারীরা রিভিউ দিতে পারবেন।"
        actionTrigger={
          <Button size="sm">
            <MessageCircle />
            রিভিউ লিখুন
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-5 shrink-0" />
            <p className="text-xs leading-relaxed">
              আপনি বর্তমানে লগআউট অবস্থায় আছেন। রিভিউ লিখতে এবং আপনার অভিজ্ঞতা শেয়ার করতে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              render={<Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} />}
              size="sm"
            >
              <LogIn />
              লগইন করতে এগিয়ে যান
            </Button>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  // 2. Logged-in User Review Form
  function handleFormSubmit(data: ReviewData) {
    if (!surveyorProfileId) {
      ErrorToast("সার্ভেয়ার প্রোফাইল পাওয়া যায়নি।");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createReviewAction({
          surveyorProfileId,
          serviceName: data.serviceName || undefined,
          rating: data.rating,
          comment: data.comment.trim(),
        });

        if (res.success) {
          SuccessToast(
            "আপনার রিভিউটি সফলভাবে জমা হয়েছে। এডমিনের যাচাইয়ের পর প্রকাশিত হবে।",
          );
          form.reset();
          setOpen(false);
        } else {
          ErrorToast(res.message || "রিভিউ জমা দিতে ব্যর্থ হয়েছে।");
        }
      } catch {
        ErrorToast("রিভিউ জমা দেওয়ার সময় একটি ত্রুটি ঘটেছে।");
      }
    });
  }

  return (
    <ModalWrapper
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          setOpen(next);
          if (!next) form.reset();
        }
      }}
      title="রিভিউ লিখুন"
      description="আপনার কাজের অভিজ্ঞতা শেয়ার করুন। রিভিউটি এডমিন দ্বারা যাচাইয়ের পর প্রকাশ করা হবে।"
      actionTrigger={
        <Button size="sm">
          <MessageCircle />
          রিভিউ লিখুন
        </Button>
      }
    >
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-4">
          {/* Authenticated User Preview */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={currentUser.imageUrl} alt={currentUser.name} />
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <UserCheck className="size-3" />
                  ভেরিফাইড ইউজার
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate font-mono">
                {currentUser.email}
              </span>
            </div>
          </div>

          {/* Service Selection */}
          <Controller
            name="serviceName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>কোন সার্ভিস ব্যবহার করেছেন?</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    if (val) field.onChange(val);
                  }}
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
                    placeholder="সার্ভেয়ারের কাজ ও সেবা নিয়ে আপনার বাস্তব অভিজ্ঞতা লিখুন..."
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

          <Button
            type="submit"
            disabled={isPending || !form.formState.isValid}
            loading={isPending}
            loadingText="জমা হচ্ছে..."
            className="w-full"
          >
            রিভিউ জমা দিন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
