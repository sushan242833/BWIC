import type {
  LocationPlaceDetails,
  LocationSuggestion,
} from "@/modules/locations/types";
import type { PropertySummary } from "@/modules/properties/types";
import type { RecommendationWeights } from "@/modules/recommendation-settings/types";

export interface RecommendationPreferences {
  brief: string;
  location: string;
  price: string;
  roi: string;
  area: string;
  maxDistanceFromHighway: string;
}

export interface RecommendationQuery {
  brief?: string;
  mustHave?: Partial<RecommendationMustHavePayload>;
  preferences?: Partial<RecommendationPreferencesPayload>;
  page?: number;
  limit?: number;
}

export interface RecommendationMustHavePayload {
  categoryId?: number;
  category?: string;
  location?: string;
  maxPrice?: number;
  minRoi?: number;
  minArea?: number;
  maxDistanceFromHighway?: number;
  status?: string;
}

export interface RecommendationPreferencesPayload {
  categoryId?: number;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  locationRadiusKm?: number;
  price?: number;
  roi?: number;
  area?: number;
  maxDistanceFromHighway?: number;
  status?: string;
}

export interface RecommendationDetectedEntity {
  type:
    | "category"
    | "location"
    | "maxPrice"
    | "preferredPrice"
    | "minRoi"
    | "preferredRoi"
    | "minArea"
    | "preferredArea"
    | "maxDistanceFromHighway"
    | "status";
  value: string | number;
  raw: string;
}

export type RecommendationExtractionSource = "ai";

export interface RecommendationParsedBriefMetadata {
  brief?: string;
  extractionSource?: RecommendationExtractionSource;
  detectedEntities: RecommendationDetectedEntity[];
  parsedMustHave: RecommendationMustHavePayload;
  parsedPreferences: RecommendationPreferencesPayload;
  appliedFilters: RecommendationMustHavePayload;
  appliedPreferences: RecommendationPreferencesPayload;
  warnings: string[];
}

export interface RecommendationResponseMeta {
  parsedBrief: RecommendationParsedBriefMetadata;
  appliedWeights: RecommendationWeights;
  isDefaultWeights?: boolean;
  weightSource?: "default" | "user";
}

export type RecommendationLocationSuggestion = LocationSuggestion;
export type RecommendationPlaceDetails = LocationPlaceDetails;

export interface RecommendationExplanation {
  category:
    | "location"
    | "price"
    | "roi"
    | "area"
    | "highwayAccess"
    | "distance";
  sentiment: "positive" | "negative" | "neutral";
  reason: string;
  points: number;
}

export interface RecommendationScoreBreakdown {
  location?: number;
  price?: number;
  roi?: number;
  area?: number;
  highwayAccess?: number;
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
  meta?: RecommendationResponseMeta;
}

export interface RecommendationDetailAnalysis
  extends Omit<RecommendationItem, "property"> {
  rank: number | null;
}

export interface RecommendationDetailData {
  property: PropertySummary;
  recommendation: RecommendationDetailAnalysis;
  meta: RecommendationResponseMeta;
}

export interface RecommendationDetailResponse {
  success: boolean;
  message: string;
  data: RecommendationDetailData;
}

export const defaultRecommendationPreferences: RecommendationPreferences = {
  brief: "",
  location: "",
  price: "",
  roi: "",
  area: "",
  maxDistanceFromHighway: "",
};
