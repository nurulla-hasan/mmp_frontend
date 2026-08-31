"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { verifySurveyorAction } from "../_actions/verification.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";

const rejectionSchema = z.object({
  adminNote: z
    .string()
    .min(5, "Please provide a reason with at least 5 characters for rejection.")
    .max(500, "Reason must not exceed 500 characters."),
});

type RejectionFormValues = z.infer<typeof rejectionSchema>;

interface VerificationDecisionModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VerificationDecisionModal({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: VerificationDecisionModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionSchema),
    mode: "onChange",
    defaultValues: {
      adminNote: "",
    },
  });

  const onSubmit = async (values: RejectionFormValues) => {
    try {
      const res = await verifySurveyorAction(userId, {
        status: "REJECTED",
        adminNote: values.adminNote.trim(),
      });

      if (res.success) {
        SuccessToast(`Application for "${userName}" has been rejected.`);
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        ErrorToast(res.message || "Failed to reject application.");
      }
    } catch {
      ErrorToast("An error occurred while rejecting application.");
    }
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
      title="Reject Surveyor Application"
      description={`Specify the reason for rejecting "${userName}'s" verification application.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            The applicant will be informed of this reason to help them update their credentials before re-applying.
          </span>
        </div>

        <FormInput
          control={control}
          name="adminNote"
          label="Rejection Reason & Note"
          placeholder="e.g. Document unreadable, invalid surveying license, or incorrect service coverage..."
          type="textarea"
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            loading={isSubmitting}
            loadingText="Rejecting..."
            disabled={!isValid}
          >
            <X />
            Confirm Rejection
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
