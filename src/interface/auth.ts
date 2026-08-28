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
  role: "USER" | "SURVEYOR" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  email_verified: boolean;
  is_subscribed: boolean;
  image_url: string;
  phone: string;
  whatsapp_number: string;
  district: string;
  upazila: string;
  created_at: string;
  updated_at: string;
};
