import type { UrlObject } from "url";
import { APP_ROUTES } from "@/config/routes";

export const RECOMMENDATIONS_RETURN_SOURCE = "recommendations";

const getSingleQueryValue = (
  value: string | string[] | undefined,
): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
};

export const isRecommendationReturnSource = (
  value: string | string[] | undefined,
): boolean => getSingleQueryValue(value) === RECOMMENDATIONS_RETURN_SOURCE;

export const getSafeReturnTo = (
  value: string | string[] | undefined,
): string | null => {
  const returnTo = getSingleQueryValue(value);

  if (!returnTo || !returnTo.startsWith("/")) {
    return null;
  }

  return returnTo;
};

export const buildRecommendationDetailHref = (
  propertyId: string | number,
  returnTo: string,
): UrlObject => ({
  pathname: APP_ROUTES.propertyDetail(propertyId),
  query: {
    from: RECOMMENDATIONS_RETURN_SOURCE,
    returnTo: returnTo || APP_ROUTES.recommendations,
  },
});
