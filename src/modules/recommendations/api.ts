import { API_ENDPOINTS } from "@/lib/api/routes";
import { getJson } from "@/lib/api/client";
import type {
  RecommendationPreferences,
  RecommendationPreferencesPayload,
  RecommendationQuery,
  RecommendationResponse,
} from "@/modules/recommendations/types";

const toOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number.parseFloat(trimmed.replace(/,/g, ""));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toOptionalString = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const buildRecommendationPreferencesPayload = (
  values: RecommendationPreferences,
): RecommendationPreferencesPayload => ({
  location: toOptionalString(values.location),
  locationRadiusKm: toOptionalNumber(values.locationRadiusKm),
  price: toOptionalNumber(values.price),
  roi: toOptionalNumber(values.roi),
  area: toOptionalNumber(values.area),
  maxDistanceFromHighway: toOptionalNumber(values.maxDistanceFromHighway),
});

const omitEmptySections = (query: RecommendationQuery): RecommendationQuery => {
  const preferenceEntries = Object.entries(query.preferences || {}).filter(
    ([, value]) => value !== undefined,
  );

  return {
    ...(preferenceEntries.length > 0
      ? { preferences: Object.fromEntries(preferenceEntries) }
      : {}),
    ...(query.page ? { page: query.page } : {}),
    ...(query.limit ? { limit: query.limit } : {}),
  };
};

export const getRecommendations = async (
  query: RecommendationQuery,
): Promise<RecommendationResponse> =>
  getJson(API_ENDPOINTS.recommendations.list, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omitEmptySections(query)),
  });
