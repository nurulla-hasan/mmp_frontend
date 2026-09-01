"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Check,
  Copy,
  PhoneCall,
  Clock,
  Receipt,
  Sparkles,
} from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { FormInput } from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { submitManualCheckoutAction } from "@/app/(private)/(admin)/admin/subscribers/_actions/subscriber.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TPlan } from "@/interface/plan";
import type { PaymentNumbersResponse, TSubscriber } from "@/interface/subscriber";

const manualCheckoutFormSchema = z.object({
  senderPhone: z
    .string()
    .min(6, "Please enter your sender phone number.")
    .max(20, "Phone number is too long."),
  transactionId: z
    .string()
    .min(4, "Please enter the Transaction ID (TrxID).")
    .max(50, "Transaction ID is too long."),
});

type ManualCheckoutFormValues = z.infer<typeof manualCheckoutFormSchema>;

interface ManualCheckoutModalProps {
  plan: TPlan;
  paymentNumbers?: PaymentNumbersResponse;
  isPending?: boolean;
  pendingData?: TSubscriber | null;
  trigger?: React.ReactNode;
}

export function ManualCheckoutModal({
  plan,
  paymentNumbers = {
    bkashNumber: "01750-974716 (Personal / Send Money)",
    nagadNumber: "01750-974716 (Personal / Send Money)",
    rocketNumber: "",
    instructions:
      "Please Send Money the required amount to any of the numbers above. After sending, enter your sender phone number and Transaction ID (TrxID) below to submit your payment request.",
  },
  isPending = false,
  pendingData,
  trigger,
}: ManualCheckoutModalProps) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"BKASH" | "NAGAD" | "ROCKET">("BKASH");
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedTrxId, setSubmittedTrxId] = useState(pendingData?.transactionId || "");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ManualCheckoutFormValues>({
    resolver: zodResolver(manualCheckoutFormSchema) as never,
    defaultValues: {
      senderPhone: "",
      transactionId: "",
    },
  });

  const getTargetNumber = () => {
    if (method === "BKASH") return paymentNumbers.bkashNumber || "01700-000000";
    if (method === "NAGAD") return paymentNumbers.nagadNumber || "01800-000000";
    if (method === "ROCKET") return paymentNumbers.rocketNumber || "01900-000000";
    return paymentNumbers.bkashNumber || "01700-000000";
  };

  const handleCopy = () => {
    const rawNumber = getTargetNumber().split(" ")[0].replace(/[^0-9]/g, "");
    navigator.clipboard.writeText(rawNumber || getTargetNumber());
    setCopied(true);
    SuccessToast("Number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values: ManualCheckoutFormValues) => {
    const res = await submitManualCheckoutAction({
      planId: plan.id,
      paymentMethod: method,
      senderPhone: values.senderPhone.trim(),
      transactionId: values.transactionId.trim().toUpperCase(),
    });

    if (res.success) {
      setSubmittedTrxId(values.transactionId.trim().toUpperCase());
      setIsSuccess(true);
      SuccessToast("Payment request submitted successfully!");
    } else {
      ErrorToast(res.message || "Failed to submit request. Please try again.");
    }
  };

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setIsSuccess(false);
      reset();
    }
  };

  const showStatusView = isSuccess || isPending;
  const currentTrx = submittedTrxId || pendingData?.transactionId || "";

  return (
    <ModalWrapper
      open={open}
      onOpenChange={handleModalClose}
      title={showStatusView ? "Payment Verification Status" : "Manual Payment Checkout"}
      description={
        showStatusView
          ? "Your subscription request is being reviewed by the administration team."
          : "Complete your payment via bKash, Nagad or Rocket to activate Pro access."
      }
      actionTrigger={
        trigger || (
          <Button variant="default" className="w-full cursor-pointer">
            <Sparkles />
            Upgrade to {plan.name}
          </Button>
        )
      }
    >
      {showStatusView ? (
        <div className="py-4 flex flex-col items-center text-center space-y-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Clock className="size-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">
              {isSuccess ? "Payment Request Submitted!" : "Payment Under Verification"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Your payment for{" "}
              <span className="font-semibold text-foreground">
                {plan.name} (৳{plan.price})
              </span>{" "}
              is currently pending admin verification. Your Pro access will be activated immediately once approved.
            </p>
          </div>

          <div className="w-full rounded-xl border border-border/80 bg-muted/40 p-3 text-left space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium text-foreground">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-foreground">৳{plan.price}</span>
            </div>
            {currentTrx && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">TrxID:</span>
                <span className="font-mono font-medium text-primary">
                  {currentTrx}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ⏳ Pending Review
              </span>
            </div>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => handleModalClose(false)}
          >
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Selected Plan Summary Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground">
                    {plan.name}
                  </span>
                  <Badge variant="progress" className="text-[10px] py-0">
                    {plan.durationDays} Days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Package activation upon payment verification
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary font-heading">
                  ৳{plan.price}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              1. Select Payment Method
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(["BKASH", "NAGAD", "ROCKET"] as const).map((m) => {
                const isSelected = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs">{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions & Number Copy Card */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <PhoneCall className="size-3.5 text-primary shrink-0" />
                <span>Send Money to {method} Number:</span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleCopy}
              >
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="p-2 bg-background rounded-lg border border-border/60 text-center font-mono font-bold text-sm text-foreground">
              {getTargetNumber()}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Send <span className="font-bold text-foreground">৳{plan.price}</span>{" "}
              via Send Money to the number above, then submit your details below.
            </p>
          </div>

          {/* Form Inputs with Custom FormInput Component */}
          <div className="space-y-3">
            <FormInput
              control={control}
              name="senderPhone"
              label="2. Your Sender Number"
              placeholder="e.g. 01712345678"
              inputMode="tel"
            />

            <FormInput
              control={control}
              name="transactionId"
              label="3. Transaction ID (TrxID)"
              placeholder="e.g. BL92XK8291"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              loading={isSubmitting}
              loadingText="Submitting Request..."
            >
              <Receipt />
              Submit Payment for Verification
            </Button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
