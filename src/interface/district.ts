import type { TQuery } from "./global";

export interface TUpazila {
  id: string;
  name: string;
  slug: string;
  districtId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TDistrict {
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
  upazilas: string[];
  upazilaList?: TUpazila[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDistrictPayload {
  name: string;
  slug: string;
}

export interface UpdateDistrictPayload {
  name?: string;
  slug?: string;
}

export interface CreateUpazilaPayload {
  name: string;
  slug: string;
  districtId: string;
}

export interface UpdateUpazilaPayload {
  name?: string;
  slug?: string;
  districtId?: string;
}

export type TDistrictQuery = TQuery;
