import { API_ENDPOINTS } from "@/lib/api/routes";
import { getApiData, sendJson } from "@/lib/api/client";
import type {
  CategoryDetail,
  CategorySummary,
} from "@/modules/categories/types";

export const getCategories = () =>
  getApiData<CategorySummary[]>(API_ENDPOINTS.categories.list);

export const getCategory = (id: string | number) =>
  getApiData<CategoryDetail>(API_ENDPOINTS.categories.detail(id));

export const createCategory = (name: string) =>
  sendJson(API_ENDPOINTS.categories.list, {
    method: "POST",
    body: { name },
  });

export const updateCategory = (id: string | number, name: string) =>
  sendJson(API_ENDPOINTS.categories.detail(id), {
    method: "PUT",
    body: { name },
  });

export const deleteCategory = (id: number) =>
  sendJson(API_ENDPOINTS.categories.detail(id), {
    method: "DELETE",
  });
