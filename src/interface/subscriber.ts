import type { TQuery } from "./global";
import type { TPlan } from "./plan";

export type TSubscriptionStatus =
  | "ALL"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "PENDING";

export interface TSubscriberUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  role: string;
  status: string;
  isSubscribed: boolean;
}

export interface TSubscriber {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  startDate: string;
  endDate: string;
  paymentMethod: string;
  transactionId: string;
  amountPaid: number;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  user: TSubscriberUser;
  plan: TPlan;
}

export interface TSubscriberQuery extends TQuery {
  status?: TSubscriptionStatus;
  planId?: string;
  sortBy?: "newest" | "oldest" | "expires_soon" | "expires_latest";
}

export interface CreateSubscriptionPayload {
  userId: string;
  planId: string;
  durationDays?: number;
  endDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  amountPaid?: number;
  adminNote?: string;
}

export interface UpdateSubscriptionPayload {
  planId?: string;
  status?: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
  endDate?: string;
  adminNote?: string;
}

