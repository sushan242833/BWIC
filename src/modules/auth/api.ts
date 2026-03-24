import { API_ENDPOINTS } from "@/lib/api/routes";
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

export const getCurrentUser = () =>
  getApiData<AuthUser | null>(API_ENDPOINTS.auth.me);

export const registerUser = (payload: RegisterPayload) =>
  sendApiData<AuthUser>(API_ENDPOINTS.auth.register, {
    method: "POST",
    body: payload,
  });

export const loginUser = (payload: LoginPayload) =>
  sendApiData<AuthUser>(API_ENDPOINTS.auth.login, {
    method: "POST",
    body: payload,
  });

export const forgotPassword = (payload: ForgotPasswordPayload) =>
  sendApiData<ForgotPasswordResponse>(API_ENDPOINTS.auth.forgotPassword, {
    method: "POST",
    body: payload,
  });

export const validateResetToken = (token: string) =>
  getApiData<ValidateResetTokenResponse>(
    `${API_ENDPOINTS.auth.validateResetToken}?token=${encodeURIComponent(
      token,
    )}`,
  );

export const resetPassword = (payload: ResetPasswordPayload) =>
  sendApiData<null>(API_ENDPOINTS.auth.resetPassword, {
    method: "POST",
    body: payload,
  });

export const logoutUser = () =>
  sendApiData<null>(API_ENDPOINTS.auth.logout, {
    method: "POST",
  });
