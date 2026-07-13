export type TSurveyorProfile = {
  id: string;
  slug: string;
  fullName: string;
  profilePhoto?: string;
  headline: string;
  bio?: string;

  isVerified: boolean;

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

  services: {
    id: string;
    slug: string;
    name: string;
  }[];

  rating: number;
  totalReviews: number;
  completedRequests: number;

  pricingType: "QUOTATION_BASED" | "FIXED_PRICE";
  startingPrice: number | null;

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
};
