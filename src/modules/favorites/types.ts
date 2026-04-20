import type { PropertySummary } from "@/modules/properties/types";

export interface FavoriteStatus {
  propertyId: number;
  isFavorited: boolean;
}

export interface FavoriteItem {
  id: number;
  property: PropertySummary;
  createdAt: string;
}

export interface FavoritesList {
  items: FavoriteItem[];
}
