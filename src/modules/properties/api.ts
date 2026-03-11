import { getJson, sendJson } from "@/lib/api/client";

export interface GetPropertiesParams {
  location?: string;
  categoryId?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
  minRoi?: string | number;
  minArea?: string | number;
  maxDistanceFromHighway?: string | number;
  status?: string;
  sort?: "price_asc" | "price_desc" | "roi_desc" | "newest";
  page?: number;
  limit?: number;
}

export async function getProperties(params?: GetPropertiesParams) {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        searchParams.set(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  return getJson(`/api/properties${query ? `?${query}` : ""}`);
}

export async function deleteProperty(id: number) {
  return sendJson(`/api/properties/${id}`, {
    method: "DELETE",
  });
}
