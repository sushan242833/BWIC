import { apiBaseUrl } from "@/lib/config";
import { buildApiError } from "@/lib/api/errors";

type ApiSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};

export const apiFetch = (
  path: string,
  init?: RequestInit,
): Promise<Response> => {
  return fetch(apiUrl(path), {
    credentials: "include",
    ...init,
  });
};

export const getJson = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await apiFetch(path, init);
  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json() as Promise<T>;
};

export const getApiData = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const payload = await getJson<ApiSuccessResponse<T>>(path, init);
  return payload.data;
};

export const sendJson = async <T>(
  path: string,
  options: {
    method: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  },
): Promise<T> => {
  const response = await apiFetch(path, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const sendApiData = async <T>(
  path: string,
  options: {
    method: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  },
): Promise<T> => {
  const payload = await sendJson<ApiSuccessResponse<T>>(path, options);
  return payload.data;
};

export const sendForm = async <T>(
  path: string,
  options: {
    method: "POST" | "PUT" | "PATCH";
    body: FormData;
  },
): Promise<T> => {
  const response = await apiFetch(path, {
    method: options.method,
    body: options.body,
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json() as Promise<T>;
};

export const sendFormApiData = async <T>(
  path: string,
  options: {
    method: "POST" | "PUT" | "PATCH";
    body: FormData;
  },
): Promise<T> => {
  const payload = await sendForm<ApiSuccessResponse<T>>(path, options);
  return payload.data;
};

export const assetUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};
