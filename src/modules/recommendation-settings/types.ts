export const RECOMMENDATION_WEIGHT_KEYS = [
  "location",
  "price",
  "area",
  "roi",
  "highwayAccess",
] as const;

export type RecommendationWeightKey =
  (typeof RECOMMENDATION_WEIGHT_KEYS)[number];

export type RecommendationWeights = Record<RecommendationWeightKey, number>;

export const RECOMMENDATION_WEIGHT_TOTAL = 100;

export interface RecommendationSettingsResponse {
  weights: RecommendationWeights;
  isDefault: boolean;
}

export interface RecommendationSettingsUpdateResponse {
  weights: RecommendationWeights;
}

export type UpdateRecommendationSettingsPayload = RecommendationWeights;

export const RECOMMENDATION_WEIGHT_FIELDS: Array<{
  key: RecommendationWeightKey;
  label: string;
  helper: string;
}> = [
  {
    key: "location",
    label: "Location",
    helper: "Prioritize closeness to the preferred city or selected area.",
  },
  {
    key: "price",
    label: "Price",
    helper: "Prioritize matches close to the preferred price or budget.",
  },
  {
    key: "area",
    label: "Area",
    helper: "Prioritize properties close to the preferred size.",
  },
  {
    key: "roi",
    label: "ROI",
    helper: "Prioritize properties that meet the target return.",
  },
  {
    key: "highwayAccess",
    label: "Highway Access",
    helper: "Prioritize properties close to the preferred highway distance.",
  },
];
