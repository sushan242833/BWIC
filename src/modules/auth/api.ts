import { getApiData, sendApiData } from "@/lib/api/client";
import { AuthUser, LoginPayload, RegisterPayload } from "@/modules/auth/types";

export const getCurrentUser = () => getApiData<AuthUser | null>("/api/auth/me");

export const registerUser = (payload: RegisterPayload) =>
  sendApiData<AuthUser>("/api/auth/register", {
    method: "POST",
    body: payload,
  });

export const loginUser = (payload: LoginPayload) =>
  sendApiData<AuthUser>("/api/auth/login", {
    method: "POST",
    body: payload,
  });

export const logoutUser = () =>
  sendApiData<null>("/api/auth/logout", {
    method: "POST",
  });
