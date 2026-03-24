import type { LocationSuggestion } from "@/modules/locations/types";

export interface CategoryOption {
  id: number;
  name: string;
  propertyCount?: number;
}

export interface PropertySummary {
  id: number;
  title: string;
  categoryId: number;
  category: CategoryOption | null;
  location: string;
  price: string;
  roi: string;
  status: string;
  area: string;
  areaNepali?: string;
  distanceFromHighway?: number;
  images: string[];
  primaryImage?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyDetail extends PropertySummary {
  latitude?: number;
  longitude?: number;
}

export type Property = PropertySummary;

export interface PropertyFormData {
  title: string;
  categoryId: number;
  location: string;
  price: string;
  roi: string;
  status: string;
  area: string;
  areaNepali?: string;
  distanceFromHighway?: number;
  images: File[];
  existingImages?: string[];
  description: string;
}

export interface PropertiesResponse {
  data: PropertySummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PropertiesApiResponse {
  data: PropertySummary[];
  pagination?: PropertiesResponse["pagination"];
}

export type { LocationSuggestion };
