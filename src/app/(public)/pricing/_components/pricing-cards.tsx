"use client";

import { Check, Zap, Sparkles, Crown, Clock, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { ManualCheckoutModal } from "@/components/common/manual-checkout-modal";
import { toBengaliDigits, formatDate } from "@/lib/utils";
import type { TPlan } from "@/interface/plan";
import type { PaymentNumbersResponse, MySubscriptionResponse } from "@/interface/subscriber";

interface PricingCardsProps {
  compact?: boolean;
  plans?: TPlan[];
  paymentNumbers?: PaymentNumbersResponse;
  mySubscription?: MySubscriptionResponse;
}

export function PricingCards({
  compact,
  plans = [],
  paymentNumbers,
  mySubscription,
}: PricingCardsProps) {
  if (!plans || plans.length === 0) {
    return null;
  }

  const activeSub = mySubscription?.activeSubscription;
  const pendingSub = mySubscription?.pendingSubscription;

  return (
    <SectionWrapper asSection>
      {/* Current Active Plan Status Banner */}
      {activeSub && (
        <div className="mb-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm shadow-emerald-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-foreground">
                    আপনার বর্তমান সক্রিয় প্ল্যান:{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {activeSub.plan?.name || "Pro Plan"}
                    </span>
                  </h4>
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">
                    সক্রিয় (Active)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  শুরু: {formatDate(activeSub.startDate)} • মেয়াদ শেষ:{" "}
                  <span className="font-semibold text-foreground">
                    {formatDate(activeSub.endDate)}
                  </span>
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-background/80 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              সকল প্রো ফিচার আনলকড
            </div>
          </div>
        </div>
      )}

      {/* Pending Payment Status Banner */}
      {pendingSub && (
        <div className="mb-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm shadow-amber-500/5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <Clock className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-bold text-foreground">
                  পেমেন্ট ভেরিফিকেশন প্রক্রিয়াধীন:{" "}
                  <span className="text-amber-600 dark:text-amber-400">
                    {pendingSub.plan?.name || "Pro Plan"}
                  </span>
                </h4>
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs">
                  পেন্ডিং (Pending)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                মেথড: {pendingSub.paymentMethod} • TrxID:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {pendingSub.transactionId}
                </span>{" "}
                • অ্যাডমিন ভেরিফাই করলেই আপনার একাউন্টে প্ল্যানটি সক্রিয় হয়ে যাবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const currentActivePlan = activeSub
            ? plans.find((p) => p.id === activeSub.planId) || activeSub.plan
            : null;

          const isActivePlan = activeSub?.planId === plan.id;
          const isPendingPlan = pendingSub?.planId === plan.id;
          const isDowngrade = Boolean(
            activeSub &&
              !isActivePlan &&
              currentActivePlan &&
              plan.durationDays < currentActivePlan.durationDays
          );
          const isUpgrade = Boolean(
            activeSub &&
              !isActivePlan &&
              currentActivePlan &&
              plan.durationDays > currentActivePlan.durationDays
          );
          const isRecommended = plan.isPopular && !isActivePlan && !isDowngrade;

          const periodText =
            plan.billingCycle === "MONTHLY"
              ? "/মাস"
              : plan.billingCycle === "SIX_MONTHS"
              ? "/৬ মাস"
              : plan.billingCycle === "YEARLY"
              ? "/বছর"
              : plan.billingCycle === "LIFETIME"
              ? "আজীবন"
              : `/${toBengaliDigits(plan.durationDays)} দিন`;

          const durationText =
            plan.durationDays === 30
              ? "১ মাস মেয়াদের প্যাকেজ"
              : plan.durationDays === 180
              ? "৬ মাস মেয়াদের প্যাকেজ"
              : plan.durationDays === 365
              ? "১ বছর মেয়াদের প্যাকেজ"
              : `${toBengaliDigits(plan.durationDays)} দিন মেয়াদের প্যাকেজ`;

          return (
            <Card
              key={plan.id}
              className={
                isActivePlan
                  ? "relative flex flex-col overflow-visible ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1.5"
                  : isDowngrade
                  ? "relative flex flex-col overflow-visible opacity-75 grayscale-[0.3] transition-all duration-300 hover:opacity-90"
                  : isRecommended
                  ? "relative flex flex-col overflow-visible ring-2 ring-primary shadow-lg shadow-primary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/15"
                  : "relative flex flex-col overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20"
              }
            >
              {/* Glow background for active or recommended */}
              {isActivePlan ? (
                <div className="pointer-events-none absolute -inset-px rounded-[calc(var(--radius-xl)+1px)] bg-linear-to-b from-emerald-500/10 via-transparent to-transparent opacity-60" />
              ) : isRecommended ? (
                <div className="pointer-events-none absolute -inset-px rounded-[calc(var(--radius-xl)+1px)] bg-linear-to-b from-primary/5 via-transparent to-transparent opacity-60" />
              ) : null}

              {/* Active / Pending / Recommended Badges */}
              {isActivePlan ? (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-white animate-pulse" />
                  আপনার বর্তমান প্ল্যান
                </span>
              ) : isPendingPlan ? (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  পেমেন্ট ভেরিফিকেশন চলছে
                </span>
              ) : isRecommended ? (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20">
                  {plan.discountBadge || "সেরা পছন্দ"}
                </span>
              ) : null}

              <CardContent className="relative flex flex-1 flex-col">
                {/* Header: Icon + Title */}
                <div className="flex items-center gap-4">
                  <div
                    className={
                      isActivePlan
                        ? "flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-sm"
                        : isRecommended
                        ? "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm"
                        : "flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted-foreground/5 text-muted-foreground"
                    }
                  >
                    {index === 0 && <Zap className="size-6" />}
                    {index === 1 && <Sparkles className="size-6" />}
                    {index >= 2 && <Crown className="size-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
                      {isActivePlan && (
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          সক্রিয়
                        </span>
                      )}
                    </div>
                    {plan.discountBadge && !isRecommended && !isActivePlan && !isDowngrade && (
                      <span className="text-xs text-primary font-medium">
                        {plan.discountBadge}
                      </span>
                    )}
                  </div>
                </div>

                {!compact && (
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                )}

                {/* Price */}
                <div className="mt-5 flex items-baseline flex-wrap">
                  <span className="text-4xl font-bold tracking-tight md:text-5xl font-heading">
                    ৳{toBengaliDigits(plan.price)}
                  </span>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <span className="ml-2 text-lg text-muted-foreground line-through">
                      ৳{toBengaliDigits(plan.originalPrice)}
                    </span>
                  )}
                  <span className="ml-1 text-sm text-muted-foreground">
                    {periodText}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {durationText}
                </p>

                {/* Active expiration notice inside active card */}
                {isActivePlan && activeSub?.endDate && (
                  <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                    📅 মেয়াদ শেষ: <span className="font-semibold">{formatDate(activeSub.endDate)}</span>
                  </div>
                )}

                {/* Features */}
                <ul className="flex-1 space-y-3 mt-6">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span
                        className={
                          isActivePlan
                            ? "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10"
                            : "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10"
                        }
                      >
                        <Check
                          className={
                            isActivePlan
                              ? "size-3 text-emerald-600"
                              : "size-3 text-primary"
                          }
                        />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA with ManualCheckoutModal or Disabled State */}
                {isDowngrade ? (
                  <div className="mt-6 space-y-1.5">
                    <Button
                      className="w-full cursor-not-allowed opacity-60"
                      variant="outline"
                      size="lg"
                      disabled
                    >
                      ডাউনগ্রেড অনুপলব্ধ
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground">
                      বর্তমান প্ল্যানের মেয়াদ শেষ হলে নিতে পারবেন
                    </p>
                  </div>
                ) : (
                  <ManualCheckoutModal
                    plan={plan}
                    paymentNumbers={paymentNumbers}
                    isPending={isPendingPlan}
                    pendingData={pendingSub}
                    trigger={
                      isPendingPlan ? (
                        <Button
                          className="mt-6 w-full opacity-90 cursor-pointer border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          variant="outline"
                          size="lg"
                        >
                          ⏳ পেমেন্ট ভেরিফিকেশন চলছে
                        </Button>
                      ) : (
                        <Button
                          className="mt-6 w-full cursor-pointer"
                          variant={
                            isActivePlan
                              ? "outline"
                              : isUpgrade
                              ? "default"
                              : isRecommended
                              ? "default"
                              : "outline"
                          }
                          size="lg"
                        >
                          {isActivePlan
                            ? "মেয়াদ বাড়ান (Renew)"
                            : isUpgrade
                            ? "আপগ্রেড করুন (Upgrade)"
                            : isRecommended
                            ? "এখনই সাবস্ক্রাইব করুন"
                            : "প্ল্যান নির্বাচন করুন"}
                        </Button>
                      )
                    }
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {compact && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          প্ল্যান, মূল্য ও ফিচার প্রয়োজন অনুযায়ী পরিবর্তিত হতে পারে।
        </p>
      )}
    </SectionWrapper>
  );
}
