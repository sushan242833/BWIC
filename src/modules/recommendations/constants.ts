import type { RecommendationPagination } from "@/modules/recommendations/types";

export const DEFAULT_RECOMMENDATION_PAGE_SIZE = 5;
export const EMPTY_RECOMMENDATION_TOTAL_PAGES = 1;

export const DEFAULT_RECOMMENDATION_PAGINATION: RecommendationPagination = {
  page: 1,
  limit: DEFAULT_RECOMMENDATION_PAGE_SIZE,
  total: 0,
  totalPages: EMPTY_RECOMMENDATION_TOTAL_PAGES,
  hasNext: false,
  hasPrev: false,
};

export const RECOMMENDATION_SCORE_WEIGHTS = {
  location: 35,
  price: 35,
  roi: 5,
  area: 20,
  distance: 5,
} as const;

export const RECOMMENDATION_SCORE_LABELS = {
  location: "Location",
  price: "Price",
  roi: "ROI",
  area: "Area",
  distance: "Access",
} as const;

export const RECOMMENDATION_FORM_TEXT = {
  locationPlaceholder: "Select preferred location",
  locationLoading: "Loading locations...",
  locationEmpty: "No locations found",
  radiusPlaceholder: "Radius km",
  pricePlaceholder: "Ideal price",
  roiPlaceholder: "Target ROI %",
  areaPlaceholder: "Ideal area sqft",
  maxDistancePlaceholder: "Preferred max distance from highway",
  generateButton: "Generate recommendations",
  resetButton: "Reset brief",
  requiresLocationSelection:
    "Please choose one of the suggested locations so the recommendation request can include accurate coordinates.",
  selectedLocationLabel: "Selected location:",
  loadError: "Failed to load recommendations.",
} as const;
