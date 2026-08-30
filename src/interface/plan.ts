import type { TQuery } from "./global";

export type TPlanBillingCycle =
  | "MONTHLY"
  | "SIX_MONTHS"
  | "YEARLY"
  | "LIFETIME"
  | "CUSTOM";

export interface TPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  discountBadge?: string | null;
  durationDays: number;
  billingCycle: TPlanBillingCycle;
  tools: string[];
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}

export interface TPlanQuery extends TQuery {
  isActive?: "true" | "false" | "all";
  sortBy?: "sortOrder" | "price_asc" | "price_desc" | "newest";
}

export interface CreatePlanPayload {
  name: string;
  code: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  discountBadge?: string | null;
  durationDays: number;
  billingCycle: TPlanBillingCycle;
  tools?: string[];
  features?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;
