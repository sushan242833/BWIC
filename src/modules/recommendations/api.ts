import { API_ENDPOINTS } from "@/lib/api/routes";
import { getJson } from "@/lib/api/client";
import type {
  RecommendationMustHavePayload,
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

const toPositiveOptionalNumber = (value: string): number | undefined => {
  const parsed = toOptionalNumber(value);
  if (parsed === undefined || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

const toOptionalString = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const buildRecommendationPreferencesPayload = (
  values: RecommendationPreferences,
): RecommendationPreferencesPayload => ({
  location: toOptionalString(values.location),
  price: toPositiveOptionalNumber(values.price),
  roi: toPositiveOptionalNumber(values.roi),
  area: toPositiveOptionalNumber(values.area),
  maxDistanceFromHighway: toPositiveOptionalNumber(
    values.maxDistanceFromHighway,
  ),
});

const omitEmptyObject = <T extends object>(
  value?: T,
): T | undefined => {
  if (!value) return undefined;

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, candidate]) => {
    if (candidate === undefined) return false;
    if (typeof candidate === "string") return candidate.trim().length > 0;
    return true;
    },
  );

  return entries.length > 0 ? (Object.fromEntries(entries) as T) : undefined;
};

const omitEmptySections = (query: RecommendationQuery): RecommendationQuery => {
  const preferences = omitEmptyObject(query.preferences);
  const mustHave = omitEmptyObject(
    query.mustHave as RecommendationMustHavePayload | undefined,
  );
  const brief = query.brief?.trim();

  return {
    ...(brief ? { brief } : {}),
    ...(mustHave ? { mustHave } : {}),
    ...(preferences ? { preferences } : {}),
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
