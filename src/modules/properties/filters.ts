export const PROPERTY_FILTER_KEYS = [
  "location",
  "categoryId",
  "minPrice",
  "maxPrice",
  "minRoi",
  "minArea",
  "maxDistanceFromHighway",
  "status",
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
  status: string;
}

export const defaultPropertyFilters: PropertyFilters = {
  location: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  minRoi: "",
  minArea: "",
  maxDistanceFromHighway: "",
  status: "",
};

export const PROPERTY_SORT_VALUES = [
  "price_asc",
  "price_desc",
  "roi_desc",
  "newest",
] as const;

export type PropertySortValue = (typeof PROPERTY_SORT_VALUES)[number];

export const defaultPropertySort: PropertySortValue = "newest";

export const PROPERTY_SORT_OPTIONS: Array<{
  label: string;
  value: PropertySortValue;
}> = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "roi_desc", label: "ROI: High to Low" },
];

export const PROPERTY_STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
] as const;

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
