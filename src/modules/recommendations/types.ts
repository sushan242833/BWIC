import type {
  LocationPlaceDetails,
  LocationSuggestion,
} from "@/modules/locations/types";
import type { PropertySummary } from "@/modules/properties/types";

export interface RecommendationPreferences {
  location: string;
  locationRadiusKm: string;
  price: string;
  roi: string;
  area: string;
  maxDistanceFromHighway: string;
}

export interface RecommendationQuery {
  preferences?: Partial<RecommendationPreferencesPayload>;
  page?: number;
  limit?: number;
}

export interface RecommendationPreferencesPayload {
  location?: string;
  latitude?: number;
  longitude?: number;
  locationRadiusKm?: number;
  price?: number;
  roi?: number;
  area?: number;
  maxDistanceFromHighway?: number;
}

export type RecommendationLocationSuggestion = LocationSuggestion;
export type RecommendationPlaceDetails = LocationPlaceDetails;

export interface RecommendationExplanation {
  category: "location" | "price" | "roi" | "area" | "distance";
  sentiment: "positive" | "negative" | "neutral";
  reason: string;
  points: number;
}

export interface RecommendationScoreBreakdown {
  location?: number;
  price?: number;
  roi?: number;
  area?: number;
  distance?: number;
}

export interface RecommendationItem {
  property: PropertySummary;
  matchPercentage: number;
  score: number;
  explanation: RecommendationExplanation[];
  rankingSummary: string;
  topReasons: string[];
  penalties: string[];
  scoreBreakdown?: RecommendationScoreBreakdown;
}

export interface RecommendationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RecommendationResponse {
  success: boolean;
  message: string;
  data: RecommendationItem[];
  pagination?: RecommendationPagination;
}

export const defaultRecommendationPreferences: RecommendationPreferences = {
  location: "",
  locationRadiusKm: "",
  price: "",
  roi: "",
  area: "",
  maxDistanceFromHighway: "",
};
