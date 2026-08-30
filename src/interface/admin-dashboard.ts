export interface TAdminDashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalSurveyors: number;
    verifiedSurveyors: number;
    pendingVerifications: number;
    totalSubscribers: number;
    totalRevenue: number;
    totalCalculations: number;
    totalReviews: number;
    pendingReviews: number;
    activeBroadcasts: number;
  };
  charts: {
    monthlyGrowth: {
      month: string;
      users: number;
      subscribers: number;
    }[];
    topDistricts: {
      district: string;
      surveyors: number;
    }[];
    planShare: {
      planName: string;
      count: number;
    }[];
  };
  recentActivities: {
    id: string;
    type: "USER_SIGNUP" | "VERIFICATION_REQUEST" | "REVIEW_SUBMITTED" | "SUBSCRIPTION_CREATED";
    title: string;
    description: string;
    user?: {
      name: string;
      email: string;
      imageUrl?: string;
    };
    status?: string;
    createdAt: string;
  }[];
}

