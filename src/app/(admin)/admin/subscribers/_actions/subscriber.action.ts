"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createSubscription,
  updateSubscription,
  extendSubscription,
  revokeSubscription,
  approveSubscription,
  rejectSubscription,
  submitManualCheckout,
  updatePaymentNumbers,
} from "@/services/subscriber.service";
import type {
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
  ManualCheckoutPayload,
  PaymentNumbersResponse,
} from "@/interface/subscriber";

export async function createSubscriptionAction(
  payload: CreateSubscriptionPayload,
) {
  const result = await createSubscription(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.USERS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function updateSubscriptionAction(
  id: string,
  payload: UpdateSubscriptionPayload,
) {
  const result = await updateSubscription(id, payload);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.USERS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function extendSubscriptionAction(id: string, days: number) {
  const result = await extendSubscription(id, days);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.USERS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function revokeSubscriptionAction(id: string) {
  const result = await revokeSubscription(id);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.USERS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function approveSubscriptionAction(id: string, adminNote?: string) {
  const result = await approveSubscription(id, adminNote);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.USERS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function rejectSubscriptionAction(id: string, adminNote: string) {
  const result = await rejectSubscription(id, adminNote);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.USERS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function submitManualCheckoutAction(payload: ManualCheckoutPayload) {
  const result = await submitManualCheckout(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function updatePaymentNumbersAction(
  payload: Partial<PaymentNumbersResponse>,
) {
  const result = await updatePaymentNumbers(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.SUBSCRIBERS);
    updateTag(CACHE_TAGS.PLANS);
  }
  return result;
}
