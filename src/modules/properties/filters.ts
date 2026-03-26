import {
  PROPERTY_SORT_OPTIONS,
  type PropertySortValue,
} from "@/modules/properties/constants";

export const PROPERTY_FILTER_KEYS = [
  "location",
  "categoryId",
  "minPrice",
  "maxPrice",
  "minRoi",
  "minArea",
  "maxDistanceFromHighway",
] as const;

export type PropertyFilterKey = (typeof PROPERTY_FILTER_KEYS)[number];

export interface PropertyFilters {
  location: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  minRoi: string;
  minArea: string;
  maxDistanceFromHighway: string;
}

export const defaultPropertyFilters: PropertyFilters = {
  location: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  minRoi: "",
  minArea: "",
  maxDistanceFromHighway: "",
};

export const defaultPropertySort: PropertySortValue = "newest";

export interface PropertyFilterQuery extends Partial<PropertyFilters> {
  sort?: PropertySortValue;
  page?: number;
  limit?: number;
}

export const buildPropertySearchParams = (
  params?: PropertyFilterQuery,
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams;
  }

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
};

export const countActivePropertyFilters = (filters: PropertyFilters): number =>
  PROPERTY_FILTER_KEYS.reduce((count, key) => {
    return filters[key] !== "" ? count + 1 : count;
  }, 0);

export { PROPERTY_SORT_OPTIONS };
export type { PropertySortValue };
