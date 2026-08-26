
export const CACHE_TAGS = {
  surveyors: "surveyors",
  surveyor: (id: string) => `surveyor-${id}`,
  user: "user",
} as const;

export const CACHE_TIME = {
  fiveMinutes: 300,
  hour: 3600,
  day: 86400,
} as const;