"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import { updateMySurveyorProfileAction } from "../_actions/surveyor-profile.action";
import {
  updateProfessionalInfoSchema,
  type UpdateProfessionalInfoFormValues,
} from "@/validation/surveyor-profile.schema";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

type ProfessionalInfoUpdateProps = {
  profile: TSurveyorProfile | null;
};

export function ProfessionalInfoUpdate({ profile }: ProfessionalInfoUpdateProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateProfessionalInfoFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateProfessionalInfoSchema) as any,
    values: {
      headline: profile?.headline ?? "",
      experienceYears: profile?.experienceYears ?? 0,
      bio: profile?.bio ?? "",
    },
  });

  const onSubmit = async (values: UpdateProfessionalInfoFormValues) => {
    setError(null);
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
      title="পেশাগত তথ্য আপডেট করুন"
      description="আপনার শিরোনাম, অভিজ্ঞতা ও সম্পর্কে লিখুন।"
      actionTrigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit professional info"
        >
          <Edit />
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={control}
          name="headline"
          label="পেশাদার শিরোনাম"
          placeholder="যেমন: পেশাদার ভূমি জরিপকারী"
        />
        <FormInput
          control={control}
          name="experienceYears"
          label="অভিজ্ঞতা (বছর)"
          placeholder="৫"
          type="number"
        />
        <FormInput
          control={control}
          name="bio"
          label="সম্পর্কে"
          placeholder="নিজের সম্পর্কে লিখুন"
          type="textarea"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="আপডেট হচ্ছে..."
          >
            আপডেট করুন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
