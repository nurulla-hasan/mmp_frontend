import type { TQuery } from "./global";

export type TReviewStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export interface TReviewQuery extends TQuery {
  status?: TReviewStatus;
  rating?: number;
  surveyorProfileId?: string;
  sortBy?: "newest" | "oldest" | "highest_rating" | "lowest_rating";
}

export interface TReview {
  id: string;
  surveyorProfileId: string;
  reviewerName: string;
  serviceName?: string | null;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  surveyorProfile?: {
    id: string;
    slug: string;
    headline?: string;
    user?: {
      id: string;
      name: string;
      imageUrl?: string;
      phone?: string;
      district?: string;
      upazila?: string;
    };
  };
}

export interface CreateReviewPayload {
  surveyorProfileId: string;
  reviewerName: string;
  serviceName?: string;
  rating: number;
  comment: string;
}
