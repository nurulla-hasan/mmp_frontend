"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isValidElement, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../button";
import { Spinner } from "../spinner";

interface ConfirmationModalProps {
  title?: string;
  description?: string;
  confirmText?: string;
  loadingText?: string;
  cancelText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  trigger?: ReactNode;
  actionTrigger?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: ReactNode;
}

export function ConfirmationModal({
  title = "আপনি কি নিশ্চিত?",
  description = "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
  confirmText = "নিশ্চিত করুন",
  loadingText = "প্রক্রিয়াধীন...",
  cancelText = "বাতিল",
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  trigger,
  actionTrigger,
  variant = "default",
  children,
}: ConfirmationModalProps) {
  const finalTrigger = actionTrigger || trigger;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>      {finalTrigger !== null && (
        <AlertDialogTrigger
          render={
            isValidElement(finalTrigger) ? (
              finalTrigger
            ) : (
              <Button variant="outline" size="icon-sm">
                <Trash2 />
              </Button>
            )
          }
        />
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: { preventDefault: () => void; }) => {
              e.preventDefault();
              onConfirm();
            }}
            variant={variant}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner />
                {loadingText}
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
