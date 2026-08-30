import type { TSurveyorProfile } from "./surveyor-profile";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
};

export type TAuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "SURVEYOR" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BLOCKED";
  emailVerified: boolean;
  isSubscribed: boolean;
  imageUrl: string;
  phone: string;
  whatsappNumber: string;
  district: string;
  upazila: string;
  createdAt: string;
  updatedAt: string;
  surveyorProfile?: TSurveyorProfile;
};
