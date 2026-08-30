export const CACHE_TAGS = {
  ME: "me",
  USERS: "users",
  SURVEYORS: "surveyors",
  SURVEYOR: (id: string) => `surveyor-${id}`,
  SURVEYOR_PROFILE: "surveyor-profile",
  CALCULATIONS: "calculations",
} as const;

export const CACHE_TIME = {
  FIVE_MINUTES: 300,
  HOUR: 3600,
  DAY: 86400,
} as const;