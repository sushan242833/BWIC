import axios from "axios";
import { apiBaseUrl } from "@/lib/api";

// Create the Axios instance
const API = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

type AxiosLikeError = {
  message?: string;
  response?: {
    data?: unknown;
  };
};

const isAxiosLikeError = (error: unknown): error is AxiosLikeError => {
  return typeof error === "object" && error !== null;
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosLikeError(error)) {
    return error.response?.data || error.message || "Something went wrong!";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong!";
};

// GET request
export const get = async (url: string) => {
  try {
    const response = await API.get(url);
    return { data: response.data };
  } catch (e) {
    return { error: getErrorMessage(e) };
  }
};

// POST request
export const post = async (url: string, body: any) => {
  try {
    const response = await API.post(url, body);
    return { data: response.data };
  } catch (e) {
    return { error: getErrorMessage(e) };
  }
};
// PUT request (for editing/updating data)
export const put = async (url: string, body: any) => {
  try {
    const response = await API.put(url, body);
    return { data: response.data };
  } catch (e) {
    return { error: getErrorMessage(e) };
  }
};

// DELETE request
export const del = async (url: string) => {
  try {
    const response = await API.delete(url);
    return { data: response.data };
  } catch (e) {
    return { error: getErrorMessage(e) };
  }
};
