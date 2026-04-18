import { RECOMMENDATION_SCORE_LABELS } from "@/modules/recommendations/constants";
import { formatRecommendationCurrency } from "@/modules/recommendations/formatters";

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
