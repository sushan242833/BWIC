import { getApiData, getJson, sendForm, sendJson } from "@/lib/api/client";
import {
  buildPropertySearchParams,
  PropertyFilterQuery,
} from "@/modules/properties/filters";
import { buildPropertyFormPayload } from "@/modules/properties/form-data";
import type {
  PropertiesResponse,
  PropertyDetail,
  PropertyFormData,
} from "@/modules/properties/types";

export async function getProperties(
  params?: PropertyFilterQuery,
): Promise<PropertiesResponse> {
  const query = buildPropertySearchParams(params).toString();
  return getJson(`/api/properties${query ? `?${query}` : ""}`);
}

export const getProperty = (id: string | number) =>
  getApiData<PropertyDetail>(`/api/properties/${id}`);

export const createProperty = (data: PropertyFormData) =>
  sendForm("/api/properties", {
    method: "POST",
    body: buildPropertyFormPayload(data),
  });

export const updateProperty = (id: string | number, data: PropertyFormData) =>
  sendForm(`/api/properties/${id}`, {
    method: "PUT",
    body: buildPropertyFormPayload(data),
  });

export async function deleteProperty(id: number) {
  return sendJson(`/api/properties/${id}`, {
    method: "DELETE",
  });
}
