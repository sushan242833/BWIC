import type {
  RecommendationPagination,
  RecommendationPreferences,
} from "@/modules/recommendations/types";

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

export const DEFAULT_RECOMMENDATION_FORM_VALUES: RecommendationPreferences = {
  location: "",
  price: "",
  roi: "0",
  area: "",
  maxDistanceFromHighway: "0",
};

export const RECOMMENDATION_RANGE_LIMITS = {
  roi: {
    min: 1,
    max: 30,
    step: 0.5,
  },
  distance: {
    min: 0,
    max: 25,
    step: 0.5,
  },
} as const;

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
  locationPlaceholder: "Select a city",
  locationLoading: "Loading locations...",
  locationEmpty: "No locations found",
  pricePlaceholder: "Enter amount",
  roiPlaceholder: "Target ROI %",
  areaPlaceholder: "e.g. 1500 - 3000",
  maxDistancePlaceholder: "Preferred max distance from highway",
  generateButton: "Generate Recommendations",
  resetButton: "Reset Brief",
  requiresLocationSelection:
    "Please choose one of the suggested locations so the recommendation request can include accurate coordinates.",
  selectedLocationLabel: "Selected location",
  loadError: "Failed to load recommendations.",
} as const;
