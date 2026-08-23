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
