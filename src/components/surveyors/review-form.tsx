"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/ui/custom/star-rating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TSurveyorServiceWithPrice } from "@/types/surveyor-profile.type";

export function ReviewForm({
  services,
  onSubmit,
}: {
  services: TSurveyorServiceWithPrice[];
  onSubmit: (data: {
    reviewerName: string;
    rating: number;
    comment: string;
    serviceName: string;
  }) => void;
}) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!reviewerName.trim()) newErrors.reviewerName = "আপনার নাম লিখুন";
    if (rating === 0) newErrors.rating = "রেটিং নির্বাচন করুন";
    if (!comment.trim()) newErrors.comment = "আপনার মন্তব্য লিখুন";
    if (!serviceName) newErrors.serviceName = "সার্ভিস নির্বাচন করুন";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      reviewerName: reviewerName.trim(),
      rating,
      comment: comment.trim(),
      serviceName,
    });

    setReviewerName("");
    setRating(0);
    setComment("");
    setServiceName("");
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-base font-semibold font-heading">রিভিউ লিখুন</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        আপনার অভিজ্ঞতা শেয়ার করুন। রিভিউটি এডমিন দ্বারা যাচাইয়ের পর প্রকাশ করা হবে।
      </p>

      <div className="mt-4 space-y-4">
        {/* Name */}
        <Field>
          <FieldLabel>আপনার নাম</FieldLabel>
          <FieldGroup>
            <Input
              placeholder="যেমন: রহিম উদ্দিন"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
            />
          </FieldGroup>
          {errors.reviewerName && <FieldError>{errors.reviewerName}</FieldError>}
        </Field>

        {/* Service */}
        <Field>
          <FieldLabel>কোন সার্ভিস ব্যবহার করেছেন?</FieldLabel>
          <FieldGroup>
            <Select value={serviceName} onValueChange={(val) => val && setServiceName(val)}>
              <SelectTrigger>
                <SelectValue placeholder="সার্ভিস নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          {errors.serviceName && <FieldError>{errors.serviceName}</FieldError>}
        </Field>

        {/* Rating */}
        <Field>
          <FieldLabel>রেটিং</FieldLabel>
          <div className="mt-1">
            <StarRating
              rating={rating}
              totalStars={5}
              onRate={(val) => setRating(val)}
              size={24}
            />
          </div>
          {errors.rating && (
            <p className="mt-1 text-xs text-destructive">{errors.rating}</p>
          )}
        </Field>

        {/* Comment */}
        <Field>
          <FieldLabel>আপনার মন্তব্য</FieldLabel>
          <FieldGroup>
            <Textarea
              placeholder="সার্ভেয়ারের কাজ নিয়ে আপনার অভিজ্ঞতা লিখুন..."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </FieldGroup>
          {errors.comment && <FieldError>{errors.comment}</FieldError>}
        </Field>

        <Button type="submit" className="w-full">
          রিভিউ জমা দিন
        </Button>
      </div>
    </form>
  );
}
