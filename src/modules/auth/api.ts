import { getApiData, sendApiData } from "@/lib/api/client";
import {
  AuthUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ValidateResetTokenResponse,
} from "@/modules/auth/types";

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

export const forgotPassword = (payload: ForgotPasswordPayload) =>
  sendApiData<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: payload,
  });

export const validateResetToken = (token: string) =>
  getApiData<ValidateResetTokenResponse>(
    `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
  );

export const resetPassword = (payload: ResetPasswordPayload) =>
  sendApiData<null>("/api/auth/reset-password", {
    method: "POST",
    body: payload,
  });

export const logoutUser = () =>
  sendApiData<null>("/api/auth/logout", {
    method: "POST",
  });
