/** Browser-only preferences, keyed per user exactly as in the original app. */
export const keys = {
  onboarding: (id: string) => `biopulse-onboarding:${id}`,
  step: (id: string) => `biopulse-onboarding-step:${id}`,
  contact: (id: string) => `biopulse-coach-contact:${id}`,
  privacy: (id: string) => `biopulse-privacy-read:${id}`,
  cookie: "biopulse-cookie-choice",
};

export const landingPath = (userId: string) =>
  localStorage.getItem(keys.onboarding(userId)) === "complete" ? "/dashboard" : "/onboarding";
