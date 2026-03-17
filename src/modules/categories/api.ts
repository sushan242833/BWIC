import { getApiData, sendJson } from "@/lib/api/client";
import type {
  CategoryDetail,
  CategorySummary,
} from "@/modules/categories/types";

export const getCategories = () =>
  getApiData<CategorySummary[]>("/api/categories");

export const getCategory = (id: string | number) =>
  getApiData<CategoryDetail>(`/api/categories/${id}`);

export const createCategory = (name: string) =>
  sendJson("/api/categories/", {
    method: "POST",
    body: { name },
  });

export const updateCategory = (id: string | number, name: string) =>
  sendJson(`/api/categories/${id}`, {
    method: "PUT",
    body: { name },
  });

export const deleteCategory = (id: number) =>
  sendJson(`/api/categories/${id}`, {
    method: "DELETE",
  });
