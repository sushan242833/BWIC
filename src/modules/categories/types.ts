import type { Property } from "@/modules/properties/types";

export interface Category {
  id: number;
  name: string;
  properties: Property[];
}

export interface CategoryRow {
  id: number;
  name: string;
  properties: string;
}
