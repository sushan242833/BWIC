import type { UrlObject } from "url";
import { APP_ROUTES } from "@/config/routes";
import type {
  RecommendationPlaceDetails,
  RecommendationPreferences,
  RecommendationParsedBriefMetadata,
  RecommendationQuery,
} from "@/modules/recommendations/types";

export const RECOMMENDATIONS_RETURN_SOURCE = "recommendations";

interface RecommendationDetailNavigationContext {
  appliedValues: RecommendationPreferences;
  appliedPlaceDetails?: RecommendationPlaceDetails | null;
  parsedBrief?: RecommendationParsedBriefMetadata | null;
}

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
  context?: RecommendationDetailNavigationContext,
): UrlObject => ({
  pathname: APP_ROUTES.recommendationDetail(propertyId),
  query: {
    from: RECOMMENDATIONS_RETURN_SOURCE,
    returnTo: returnTo || APP_ROUTES.recommendations,
    ...buildRecommendationDetailQuery(context),
  },
});

const setIfFilled = (
  query: Record<string, string>,
  key: string,
  value: string | number | undefined,
) => {
  if (value === undefined) {
    return;
  }

  const normalized = String(value).trim();
  if (normalized) {
    query[key] = normalized;
  }
};

const buildRecommendationDetailQuery = (
  context?: RecommendationDetailNavigationContext,
): Record<string, string> => {
  if (!context) {
    return {};
  }

  const { appliedValues, appliedPlaceDetails, parsedBrief } = context;
  const query: Record<string, string> = {};

  if (parsedBrief) {
    const { appliedFilters, appliedPreferences } = parsedBrief;

    setIfFilled(query, "mustHaveCategoryId", appliedFilters.categoryId);
    setIfFilled(query, "mustHaveCategory", appliedFilters.category);
    setIfFilled(query, "mustHaveLocation", appliedFilters.location);
    setIfFilled(query, "maxPrice", appliedFilters.maxPrice);
    setIfFilled(query, "minRoi", appliedFilters.minRoi);
    setIfFilled(query, "minArea", appliedFilters.minArea);
    setIfFilled(
      query,
      "mustHaveMaxDistanceFromHighway",
      appliedFilters.maxDistanceFromHighway,
    );
    setIfFilled(query, "mustHaveStatus", appliedFilters.status);
    setIfFilled(query, "categoryId", appliedPreferences.categoryId);
    setIfFilled(query, "category", appliedPreferences.category);
    setIfFilled(query, "location", appliedPreferences.location);
    setIfFilled(query, "latitude", appliedPreferences.latitude);
    setIfFilled(query, "longitude", appliedPreferences.longitude);
    setIfFilled(query, "locationRadiusKm", appliedPreferences.locationRadiusKm);
    setIfFilled(query, "price", appliedPreferences.price);
    setIfFilled(query, "roi", appliedPreferences.roi);
    setIfFilled(query, "area", appliedPreferences.area);
    setIfFilled(
      query,
      "maxDistanceFromHighway",
      appliedPreferences.maxDistanceFromHighway,
    );
    setIfFilled(query, "status", appliedPreferences.status);

    if (Object.keys(query).length > 0) {
      return query;
    }
  }

  setIfFilled(query, "brief", appliedValues.brief);
  setIfFilled(
    query,
    "location",
    appliedPlaceDetails?.primaryText || appliedValues.location,
  );
  setIfFilled(query, "price", appliedValues.price);
  setIfFilled(query, "roi", appliedValues.roi);
  setIfFilled(query, "area", appliedValues.area);
  setIfFilled(
    query,
    "maxDistanceFromHighway",
    appliedValues.maxDistanceFromHighway,
  );
  setIfFilled(query, "latitude", appliedPlaceDetails?.location.lat);
  setIfFilled(query, "longitude", appliedPlaceDetails?.location.lng);

  return query;
};

const getQueryNumber = (
  value: string | string[] | undefined,
): number | undefined => {
  const raw = getSingleQueryValue(value);
  if (!raw) {
    return undefined;
  }

  const parsed = Number.parseFloat(raw.replace(/,/g, ""));
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const buildRecommendationQueryFromRouteQuery = (
  query: Record<string, string | string[] | undefined>,
): RecommendationQuery => ({
  brief: getSingleQueryValue(query.brief) ?? undefined,
  mustHave: {
    categoryId: getQueryNumber(query.mustHaveCategoryId),
    category: getSingleQueryValue(query.mustHaveCategory) ?? undefined,
    location: getSingleQueryValue(query.mustHaveLocation) ?? undefined,
    maxPrice: getQueryNumber(query.maxPrice),
    minRoi: getQueryNumber(query.minRoi),
    minArea: getQueryNumber(query.minArea),
    maxDistanceFromHighway: getQueryNumber(
      query.mustHaveMaxDistanceFromHighway,
    ),
    status: getSingleQueryValue(query.mustHaveStatus) ?? undefined,
  },
  preferences: {
    categoryId: getQueryNumber(query.categoryId),
    category: getSingleQueryValue(query.category) ?? undefined,
    location:
      getSingleQueryValue(query.location) ??
      getSingleQueryValue(query.preferredLocation) ??
      undefined,
    latitude:
      getQueryNumber(query.latitude) ?? getQueryNumber(query.preferredLatitude),
    longitude:
      getQueryNumber(query.longitude) ??
      getQueryNumber(query.preferredLongitude),
    locationRadiusKm: getQueryNumber(query.locationRadiusKm),
    price: getQueryNumber(query.price),
    roi: getQueryNumber(query.roi) ?? getQueryNumber(query.preferredRoi),
    area: getQueryNumber(query.area) ?? getQueryNumber(query.preferredArea),
    maxDistanceFromHighway:
      getQueryNumber(query.maxDistanceFromHighway) ??
      getQueryNumber(query.preferredMaxDistance),
    status: getSingleQueryValue(query.status) ?? undefined,
  },
});
