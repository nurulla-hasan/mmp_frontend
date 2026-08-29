export type TSurveyorService = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};

export type TSurveyorServiceWithPrice = {
  id: string;
  serviceId: string;
  startingPrice: number;
  service: {
    slug: string;
    name: string;
    description?: string | null;
  };
};

export type TSurveyorProfile = {
  id?: string;
  userId?: string;
  slug?: string;
  headline?: string;
  bio?: string | null;

  user?: {
    id: string;
    name: string;
    imageUrl: string;
    phone: string;
    whatsappNumber: string;
    district: string;
    upazila: string;
    isSubscribed: boolean;
    createdAt: string;
  };

  fullName?: string;
  profilePhoto?: string;
  isSubscribed?: boolean;
  joinedAt?: string;
  primaryLocation?: {
    district: string;
    upazila: string;
  };
  whatsappNumber?: string;
  completedRequests?: number;
  verification?: {
    identityReviewed: boolean;
    professionalInformationReviewed: boolean;
    verifiedAt: string;
    note: string;
  };
  reviews?: TSurveyorReview[];

  experienceYears?: number;

  certificateUrl?: string | null;

  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  isVerified?: boolean;
  verifiedAt?: string | null;
  adminNote?: string | null;

  rating?: number;
  totalReviews?: number;

  createdAt?: string;
  updatedAt?: string;

  surveyorServices?: TSurveyorServiceWithPrice[];

  serviceAreas?: {
    id?: string;
    district: string;
    upazilas: string[];
  }[];
};

export type TSurveyorReview = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  serviceName: string;
  createdAt: string;
  isVerifiedService: boolean;
  status: "approved" | "pending" | "rejected";
};
