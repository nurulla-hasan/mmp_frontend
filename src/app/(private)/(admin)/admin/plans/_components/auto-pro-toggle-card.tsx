"use client";

import { useState, useTransition } from "react";
import { Sparkles, Check, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import { setAutoProSettingAction } from "../_actions/plan.action";
import type { TPlan } from "@/interface/plan";

interface AutoProToggleCardProps {
  initialEnabled: boolean;
  initialPlanId: string | null;
  plans: TPlan[];
}

export function AutoProToggleCard({
  initialEnabled,
  initialPlanId,
  plans,
}: AutoProToggleCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    initialPlanId || (plans[0]?.id ?? null),
  );
  const [isPending, startTransition] = useTransition();

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleMasterToggle = (checked: boolean) => {
    setEnabled(checked);
    startTransition(async () => {
      const res = await setAutoProSettingAction({
        enabled: checked,
        planId: selectedPlanId,
      });
      if (res.success) {
        SuccessToast(
          checked
            ? `Auto-grant on registration enabled with "${selectedPlan?.name || "Plan"}"!`
            : "Auto-grant on registration disabled.",
        );
      } else {
        setEnabled(!checked);
        ErrorToast(res.message || "Failed to update setting.");
      }
    });
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setEnabled(true);
    const targetPlan = plans.find((p) => p.id === planId);
    startTransition(async () => {
      const res = await setAutoProSettingAction({
        enabled: true,
        planId,
      });
      if (res.success) {
        SuccessToast(
          `Auto-grant plan updated to "${targetPlan?.name || "Plan"}"!`,
        );
      } else {
        ErrorToast(res.message || "Failed to update setting.");
      }
    });
  };

  return (
    <Card className="relative overflow-hidden border border-primary/30 bg-card/95 shadow-sm transition-all duration-200 hover:border-primary/50">
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl" />
      <CardContent className="space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Gift className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-heading text-base font-bold text-foreground">
                  Auto-Grant Plan on User Registration
                </h4>
                <Badge
                  variant={enabled ? "default" : "secondary"}
                  className="text-xs font-semibold"
                >
                  {enabled ? (
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3" /> Active
                    </span>
                  ) : (
                    "Disabled"
                  )}
                </Badge>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-2xl">
                {enabled && selectedPlan ? (
                  <span className="text-foreground/90 font-medium">
                    🚀 New users will automatically be granted{" "}
                    <span className="text-primary font-bold">
                      {selectedPlan.name} ({selectedPlan.durationDays} Days)
                    </span>{" "}
                    upon registration.
                  </span>
                ) : (
                  "Auto-grant is disabled. Newly registered users will be on the default Free tier."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              {enabled ? "Enabled" : "Disabled"}
            </span>
            <Switch
              checked={enabled}
              disabled={isPending}
              onCheckedChange={handleMasterToggle}
              aria-label="Toggle auto-grant subscription on registration"
            />
          </div>
        </div>

        {/* Plan Selector Buttons Grid */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2.5">
            Select the subscription package to automatically grant upon registration:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {plans.map((plan) => {
              const isSelected = enabled && selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`group relative flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                      : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="font-heading text-xs font-bold text-foreground truncate">
                      {plan.name}
                    </span>
                    {isSelected && (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-2.5 stroke-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex w-full items-center justify-between text-[11px] text-muted-foreground">
                    <span>{plan.durationDays} Days</span>
                    <span className="font-mono font-medium text-foreground">
                      ৳{plan.price}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
