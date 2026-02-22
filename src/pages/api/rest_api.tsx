export const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

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
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        searchParams.set(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  const res = await fetch(`${baseUrl}/api/properties${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error("Failed to fetch properties");
  }
  return res.json();
}

export async function deleteProperty(id: number) {
  const res = await fetch(`${baseUrl}/api/properties/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete properties");
  }

  return res.json();
}
