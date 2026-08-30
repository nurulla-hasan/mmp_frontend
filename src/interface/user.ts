export type TUserRole = "USER" | "SURVEYOR" | "ADMIN";
export type TUserStatus = "ACTIVE" | "BLOCKED";

export type TUser = {
  id: string;
  name: string;
  email: string;
  role: TUserRole;
  status: TUserStatus;
  phone?: string;
  whatsappNumber?: string;
  district?: string;
  upazila?: string;
  imageUrl?: string;
  isSubscribed: boolean;
  emailVerified: boolean;
  createdAt: string;
  plotsMeasured: number;
  calculationsSaved: number;
  lastMeasurementAt?: string | null;
};

export type TUserQuery = {
  searchTerm?: string;
  role?: TUserRole;
  status?: TUserStatus;
  page?: number | string;
  limit?: number | string;
  sortBy?: "newest" | "oldest" | "name_asc" | "name_desc";
};

