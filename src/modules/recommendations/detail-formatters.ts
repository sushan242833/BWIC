import { RECOMMENDATION_SCORE_LABELS } from "@/modules/recommendations/constants";
import { formatRecommendationCurrency } from "@/modules/recommendations/formatters";
import type {
  RecommendationMustHavePayload,
  RecommendationPreferencesPayload,
  RecommendationScoreBreakdown,
} from "@/modules/recommendations/types";

export type RecommendationPreferenceDisplayItem = {
  label: string;
  value: string;
};

export const RECOMMENDATION_SCORE_KEYS = [
  "location",
  "price",
  "area",
  "roi",
  "highwayAccess",
] as const;

export type RecommendationScoreKey = (typeof RECOMMENDATION_SCORE_KEYS)[number];

export const formatNumber = (
  value: string | number | null | undefined,
  maximumFractionDigits = 1,
): string => {
  if (value === undefined || value === null || value === "") {
    return "Not available";
  }

  const numeric =
    typeof value === "number"
      ? value
      : Number.parseFloat(value.replace(/,/g, ""));

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits:
      numeric % 1 === 0 ? 0 : maximumFractionDigits,
  }).format(numeric);
};

export const formatCompactRecommendationCurrency = (
  value?: string | number | null,
): string => {
  if (value === undefined || value === null || value === "") {
    return "Price on request";
  }

  const numeric =
    typeof value === "number"
      ? value
      : Number.parseFloat(value.replace(/,/g, ""));

  if (Number.isNaN(numeric)) {
    return formatRecommendationCurrency(value);
  }

  if (numeric >= 10000000) {
    return `NPR ${formatNumber(numeric / 10000000, 2)} Cr`;
  }

  if (numeric >= 100000) {
    return `NPR ${formatNumber(numeric / 100000, 2)} Lakh`;
  }

  return formatRecommendationCurrency(numeric);
};

export const formatPercentValue = (
  value?: string | number | null,
  fallback = "Not available",
): string => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const numeric =
    typeof value === "number"
      ? value
      : Number.parseFloat(value.replace(/,/g, ""));

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `${formatNumber(numeric, 1)}%`;
};

export const formatAreaValue = (
  value?: string | number | null,
): string => `${formatNumber(value)} sq ft`;

export const formatHighwayDistance = (
  value?: number | null,
): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "Not available";
  }

  if (value >= 1000) {
    return `${formatNumber(value / 1000, 2)} km`;
  }

  return `${formatNumber(value, 0)} m`;
};

export const formatPreferenceDistance = (
  value?: number,
): string => {
  if (value === undefined) {
    return "Any";
  }

  return `${formatNumber(value, 2)} km`;
};

export const formatScore = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }

  return formatNumber(value, 2);
};

export const formatDateValue = (value?: string): string => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const getScoreLabel = (key: RecommendationScoreKey): string =>
  RECOMMENDATION_SCORE_LABELS[key] || key;

export const getBreakdownContribution = (
  breakdown: RecommendationScoreBreakdown | undefined,
  key: RecommendationScoreKey,
): number | undefined => {
  const value = breakdown?.[key];
  return typeof value === "number" ? value : undefined;
};

const pushItem = (
  items: RecommendationPreferenceDisplayItem[],
  label: string,
  value: string | number | undefined,
) => {
  if (value === undefined || value === "") {
    return;
  }

  items.push({
    label,
    value: String(value),
  });
};

export const buildMustHaveDisplayItems = (
  filters?: RecommendationMustHavePayload,
): RecommendationPreferenceDisplayItem[] => {
  const items: RecommendationPreferenceDisplayItem[] = [];

  pushItem(items, "Category", filters?.category);
  pushItem(items, "Category ID", filters?.categoryId);
  pushItem(items, "Location", filters?.location);
  pushItem(
    items,
    "Max price",
    filters?.maxPrice === undefined
      ? undefined
      : formatRecommendationCurrency(filters.maxPrice),
  );
  pushItem(
    items,
    "Minimum ROI",
    filters?.minRoi === undefined
      ? undefined
      : formatPercentValue(filters.minRoi),
  );
  pushItem(
    items,
    "Minimum area",
    filters?.minArea === undefined ? undefined : formatAreaValue(filters.minArea),
  );
  pushItem(
    items,
    "Max highway distance",
    filters?.maxDistanceFromHighway === undefined
      ? undefined
      : formatPreferenceDistance(filters.maxDistanceFromHighway),
  );
  pushItem(items, "Status", filters?.status);

  return items;
};

export const buildPreferenceDisplayItems = (
  preferences?: RecommendationPreferencesPayload,
): RecommendationPreferenceDisplayItem[] => {
  const items: RecommendationPreferenceDisplayItem[] = [];

  pushItem(items, "Category", preferences?.category);
  pushItem(items, "Category ID", preferences?.categoryId);
  pushItem(items, "Preferred location", preferences?.location);
  pushItem(
    items,
    "Preferred price",
    preferences?.price === undefined
      ? undefined
      : formatRecommendationCurrency(preferences.price),
  );
  pushItem(
    items,
    "Target ROI",
    preferences?.roi === undefined
      ? undefined
      : formatPercentValue(preferences.roi),
  );
  pushItem(
    items,
    "Target area",
    preferences?.area === undefined
      ? undefined
      : formatAreaValue(preferences.area),
  );
  pushItem(
    items,
    "Highway target",
    preferences?.maxDistanceFromHighway === undefined
      ? undefined
      : formatPreferenceDistance(preferences.maxDistanceFromHighway),
  );
  pushItem(
    items,
    "Location radius",
    preferences?.locationRadiusKm === undefined
      ? undefined
      : formatPreferenceDistance(preferences.locationRadiusKm),
  );
  if (
    preferences?.latitude !== undefined &&
    preferences.longitude !== undefined
  ) {
    pushItem(
      items,
      "Coordinates",
      `${formatNumber(preferences.latitude, 5)}, ${formatNumber(
        preferences.longitude,
        5,
      )}`,
    );
  }
  pushItem(items, "Status", preferences?.status);

  return items;
};
