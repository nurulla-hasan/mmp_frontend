export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: "USER" | "SURVEYOR";
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
  role: "USER" | "SURVEYOR" | "ADMIN";
  isSubscribed: boolean;
  profilePhoto?: string;
  phone?: string;
  whatsappNumber?: string;
  location?: {
    district: string;
    upazila: string;
  };
  joinedAt?: string;
  savedCalculationsCount?: number;
  savedSurveyorsCount?: number;
};
