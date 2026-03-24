import { API_ENDPOINTS } from "@/lib/api/routes";
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
  return getJson(
    `${API_ENDPOINTS.properties.list}${query ? `?${query}` : ""}`,
  );
}

export const getProperty = (id: string | number) =>
  getApiData<PropertyDetail>(API_ENDPOINTS.properties.detail(id));

export const createProperty = (data: PropertyFormData) =>
  sendForm(API_ENDPOINTS.properties.list, {
    method: "POST",
    body: buildPropertyFormPayload(data),
  });

export const updateProperty = (id: string | number, data: PropertyFormData) =>
  sendForm(API_ENDPOINTS.properties.detail(id), {
    method: "PUT",
    body: buildPropertyFormPayload(data),
  });

export async function deleteProperty(id: number) {
  return sendJson(API_ENDPOINTS.properties.detail(id), {
    method: "DELETE",
  });
}
