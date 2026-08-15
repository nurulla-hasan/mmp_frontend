"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ModalWrapper } from "@/components/common/modal-wrapper";

export interface SubscriberRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  expiresAt: string;
}

const PLAN_OPTIONS = [
  "1 Month Pro",
  "3 Months Pro",
  "6 Months Pro",
  "1 Year Pro",
  "Lifetime Pro",
];

function ManagePlanButton({ row }: { row: SubscriberRow }) {
  const [open, setOpen] = useState(false);
  const [expiry, setExpiry] = useState<Date | undefined>(
    new Date(row.expiresAt)
  );

  return (
    <ModalWrapper
      open={open}
      onOpenChange={setOpen}
      title="Update Subscription"
      description={`Manage plan for ${row.name}`}
      actionTrigger={
        <Button variant="outline" size="sm">
          Manage Plan
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {PLAN_OPTIONS.map((option) => (
            <Button key={option} variant="outline" className="justify-start">
              {option}
            </Button>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Pick custom expiry date
          </p>
          <Calendar
            mode="single"
            selected={expiry}
            onSelect={setExpiry}
            className="rounded-lg border border-border"
          />
          <Button
            className="mt-3 w-full"
            onClick={() => setOpen(false)}
            disabled={!expiry}
          >
            Set Custom Expiry
          </Button>
        </div>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setOpen(false)}
        >
          Revoke / Set Free
        </Button>
      </div>
    </ModalWrapper>
  );
}

export const subscriberColumns: ColumnDef<SubscriberRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Current Plan",
    cell: ({ row }) => <Badge variant="info">{row.original.plan}</Badge>,
  },
  {
    accessorKey: "expiresAt",
    header: "Expires At",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.expiresAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    meta: { headerClassName: "text-right" },
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ManagePlanButton row={row.original} />
      </div>
    ),
  },
];
