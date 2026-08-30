import type { TQuery } from "./global";

export type TBroadcastType = "INFO" | "WARNING" | "PROMO" | "MAINTENANCE";
export type TBroadcastTarget = "ALL" | "USERS" | "SURVEYORS" | "PRO_USERS";

export interface TBroadcast {
  id: string;
  title: string;
  message: string;
  type: TBroadcastType;
  target: TBroadcastTarget;
  linkUrl?: string | null;
  linkText?: string | null;
  isActive: boolean;
  isPinned: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TBroadcastQuery extends TQuery {
  type?: TBroadcastType | "ALL";
  target?: TBroadcastTarget | "ALL";
  isActive?: "true" | "false" | "all";
  sortBy?: "newest" | "oldest" | "pinned";
}

export interface CreateBroadcastPayload {
  title: string;
  message: string;
  type: TBroadcastType;
  target: TBroadcastTarget;
  linkUrl?: string | null;
  linkText?: string | null;
  isActive?: boolean;
  isPinned?: boolean;
  expiresAt?: string | null;
}

export type UpdateBroadcastPayload = Partial<CreateBroadcastPayload>;

