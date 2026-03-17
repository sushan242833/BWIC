import type { PropertySummary } from "@/modules/properties/types";

export interface PropertyTableRow {
  id: number;
  title: string;
  location: string;
  price: string;
  roi: string;
  status: string;
  area: string;
  areaNepali?: string;
  distanceFromHighway: string;
  images: string;
  category?: string;
}

export const formatPropertyTableRows = (
  properties: PropertySummary[],
): PropertyTableRow[] =>
  properties.map(
    ({ createdAt, updatedAt, categoryId, description, ...rest }) => ({
      ...rest,
      area: `${rest.area} sq ft`,
      distanceFromHighway:
        rest.distanceFromHighway !== undefined
          ? `${rest.distanceFromHighway}m`
          : "N/A",
      roi: `${rest.roi}%`,
      price: `Nrs. ${rest.price} per aana`,
      category: rest.category?.name ?? "N/A",
      images: `${rest.images.length} image(s)`,
    }),
  );
