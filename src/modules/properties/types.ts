export interface CategoryOption {
  id: number;
  name: string;
}

export interface LocationSuggestion {
  placeId: string;
  description: string;
}

export interface Property {
  id: number;
  title: string;
  categoryId: number;
  category?: CategoryOption;
  location: string;
  price: string;
  priceNpr?: number;
  roi: string;
  roiPercent?: number;
  status: string;
  area: string;
  areaSqft?: number;
  areaNepali?: string;
  distanceFromHighway?: number;
  images: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  data: Property[];
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
  data: Property[];
}
