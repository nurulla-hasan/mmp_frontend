export type TSurveyorServiceWithPrice = {
  id: string;
  slug: string;
  name: string;
  startingPrice: number | null;
};

export type TSurveyorProfile = {
  id: string;
  slug: string;
  fullName: string;
  profilePhoto?: string;
  headline: string;
  bio?: string;

  isVerified: boolean;
  isSubscribed?: boolean;

  experienceYears: number;
  joinedAt: string;

  primaryLocation: {
    district: string;
    upazila: string;
  };

  serviceAreas: {
    district: string;
    upazilas: string[];
  }[];

  services: TSurveyorServiceWithPrice[];

  whatsappNumber?: string;

  rating: number;
  totalReviews: number;
  completedRequests: number;

  verification: {
    identityReviewed: boolean;
    professionalInformationReviewed: boolean;
    verifiedAt: string;
    note: string;
  };

  reviews: TSurveyorReview[];
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
