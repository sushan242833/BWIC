const API_BASE_PATH = "/api";

const withApiBasePath = (path: string): string => `${API_BASE_PATH}${path}`;

export const API_ENDPOINTS = {
  auth: {
    me: withApiBasePath("/auth/me"),
    register: withApiBasePath("/auth/register"),
    login: withApiBasePath("/auth/login"),
    verifyEmail: withApiBasePath("/auth/verify-email"),
    resendOtp: withApiBasePath("/auth/resend-otp"),
    forgotPassword: withApiBasePath("/auth/forgot-password"),
    validateResetToken: withApiBasePath("/auth/validate-reset-token"),
    resetPassword: withApiBasePath("/auth/reset-password"),
    logout: withApiBasePath("/auth/logout"),
  },
  user: {
    recommendationSettings: withApiBasePath("/user/recommendation-settings"),
  },
  properties: {
    list: withApiBasePath("/properties"),
    detail: (id: string | number) => withApiBasePath(`/properties/${id}`),
  },
  favorites: {
    list: withApiBasePath("/favorites"),
    add: (propertyId: string | number) =>
      withApiBasePath(`/favorites/${propertyId}`),
    remove: (propertyId: string | number) =>
      withApiBasePath(`/favorites/${propertyId}`),
    check: (propertyId: string | number) =>
      withApiBasePath(`/favorites/check/${propertyId}`),
  },
  categories: {
    list: withApiBasePath("/categories"),
    detail: (id: string | number) => withApiBasePath(`/categories/${id}`),
  },
  recommendations: {
    list: withApiBasePath("/recommendations"),
    detail: (propertyId: string | number) =>
      withApiBasePath(`/recommendations/${propertyId}/details`),
  },
  locations: {
    autocomplete: withApiBasePath("/locations/autocomplete"),
    placeDetails: withApiBasePath("/locations/place-details"),
  },
  contacts: {
    list: withApiBasePath("/contacts"),
    detail: (id: string | number) => withApiBasePath(`/contacts/${id}`),
  },
  stats: {
    summary: withApiBasePath("/stats"),
  },
} as const;
