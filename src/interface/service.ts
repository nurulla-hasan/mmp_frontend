import type { TQuery } from "./global";

export interface TService {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  surveyorsCount?: number;
}

export interface CreateServicePayload {
  name: string;
  slug: string;
  description?: string | null;
}

export interface UpdateServicePayload {
  name?: string;
  slug?: string;
  description?: string | null;
}

export type TServiceQuery = TQuery;
