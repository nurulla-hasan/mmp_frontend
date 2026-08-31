"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { FormInput } from "@/components/common/form-input";
import { updatePaymentNumbersAction } from "../_actions/subscriber.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { PaymentNumbersResponse } from "@/interface/subscriber";

const paymentNumbersSchema = z.object({
  bkashNumber: z.string().optional().default(""),
  nagadNumber: z.string().optional().default(""),
  rocketNumber: z.string().optional().default(""),
  instructions: z.string().optional().default(""),
});

type PaymentNumbersFormValues = z.infer<typeof paymentNumbersSchema>;

interface PaymentNumbersModalProps {
  initialData?: PaymentNumbersResponse;
}

export function PaymentNumbersModal({
  initialData = {
    bkashNumber: "01750-974716 (Personal / Send Money)",
    nagadNumber: "01750-974716 (Personal / Send Money)",
    rocketNumber: "",
    instructions:
      "Please Send Money the required amount to any of the numbers above. After sending, enter your sender phone number and Transaction ID (TrxID) below to submit your payment request.",
  },
}: PaymentNumbersModalProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PaymentNumbersFormValues>({
    resolver: zodResolver(paymentNumbersSchema) as never,
    values: {
      bkashNumber: initialData.bkashNumber || "",
      nagadNumber: initialData.nagadNumber || "",
      rocketNumber: initialData.rocketNumber || "",
      instructions: initialData.instructions || "",
    },
  });

  const onSubmit = async (values: PaymentNumbersFormValues) => {
    const res = await updatePaymentNumbersAction({
      bkashNumber: values.bkashNumber?.trim(),
      nagadNumber: values.nagadNumber?.trim(),
      rocketNumber: values.rocketNumber?.trim(),
      instructions: values.instructions?.trim(),
    });

    if (res.success) {
      SuccessToast("Payment numbers & instructions updated successfully!");
      setOpen(false);
    } else {
      ErrorToast(res.message || "Failed to update payment settings.");
    }
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title="Configure Payment Numbers"
      description="Set the official MFS account numbers that will be shown to users on checkout."
      actionTrigger={
        <Button variant="outline" className="cursor-pointer">
          <Settings2 />
          Payment Numbers
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={control}
          name="bkashNumber"
          label="bKash Number"
          placeholder="e.g. 01712345678 (Personal / Send Money)"
        />

        <FormInput
          control={control}
          name="nagadNumber"
          label="Nagad Number"
          placeholder="e.g. 01812345678 (Personal / Send Money)"
        />

        <FormInput
          control={control}
          name="rocketNumber"
          label="Rocket Number (Optional)"
          placeholder="e.g. 01912345678-0 (Personal)"
        />

        <FormInput
          control={control}
          name="instructions"
          label="Payment Instructions for Users"
          placeholder="Instructions displayed to users on the checkout modal..."
          type="textarea"
        />

        <div className="pt-2 flex justify-end gap-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} loadingText="Saving...">
            <Save />
            Save Settings
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
