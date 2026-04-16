export const APP_ROUTES = {
  home: "/",
  about: "/about",
  properties: "/properties",
  propertyDetail: (id: string | number) => `/properties/${id}`,
  recommendations: "/recommendations",
  recommendationDetail: (propertyId: string | number) =>
    `/recommendations/${propertyId}/details`,
  settings: "/settings",
  contact: "/contact",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  forgotPasswordSent: "/forgot-password/sent",
  resetPassword: "/reset-password",
  adminDashboard: "/admin",
  adminLogin: "/admin/login",
  adminAddProperty: "/admin/addProperty",
  adminProperties: "/admin/properties",
  adminMessages: "/admin/messages",
  adminMessageDetail: (id: string | number) => `/admin/messages/${id}`,
  adminEditProperty: (id: string | number) => `/admin/editProperty/${id}`,
  adminCategories: "/admin/categories",
  adminCategoryDetail: (id: string | number) => `/admin/categories/${id}`,
  adminCreateCategory: "/admin/createCategory",
  adminEditCategory: (id: string | number) => `/admin/editCategory/${id}`,
} as const;

export const FULLSCREEN_ROUTES = new Set<string>([
  APP_ROUTES.login,
  APP_ROUTES.register,
  APP_ROUTES.adminLogin,
  APP_ROUTES.forgotPassword,
  APP_ROUTES.forgotPasswordSent,
  APP_ROUTES.resetPassword,
]);

export const SESSION_AWARE_AUTH_ROUTES = new Set<string>([
  APP_ROUTES.login,
  APP_ROUTES.register,
  APP_ROUTES.adminLogin,
]);

export const isProtectedAdminRoute = (pathname: string): boolean =>
  pathname.startsWith(APP_ROUTES.adminDashboard) &&
  pathname !== APP_ROUTES.adminLogin;
