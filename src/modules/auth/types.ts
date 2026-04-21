export const USER_ROLES = ["ADMIN", "USER"] as const;
export const USER_ROLE = {
  ADMIN: USER_ROLES[0],
  USER: USER_ROLES[1],
} as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterResponse {
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  scope?: UserRole;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ResendOtpResponse {
  email: string;
  resendCooldownSeconds: number;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  resendCooldownSeconds: number;
}

export interface ValidateResetTokenResponse {
  valid: true;
  expiresAt: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
