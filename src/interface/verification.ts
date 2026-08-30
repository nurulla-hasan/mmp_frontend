import type { TSurveyorProfile } from "./surveyor-profile";
import type { TQuery } from "./global";

export type TVerificationStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export interface TVerificationQuery extends TQuery {
  status?: TVerificationStatus;
}

export interface VerifySurveyorPayload {
  status: "APPROVED" | "REJECTED";
  adminNote?: string | null;
}

export type TVerificationRequest = TSurveyorProfile;

