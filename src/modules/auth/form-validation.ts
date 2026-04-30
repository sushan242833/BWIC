import {
  getPasswordStrengthError,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/modules/auth/password-policy";

type AuthFieldName =
  | "fullName"
  | "email"
  | "password"
  | "otp"
  | "newPassword"
  | "confirmPassword";

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeText = (value: string): string => value.trim();

const validateEmail = (value: string): string | undefined => {
  const normalized = normalizeText(value).toLowerCase();

  if (!normalized) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return "Enter a valid email address.";
  }

  return undefined;
};

const validatePassword = (value: string): string | undefined => {
  if (!value.trim()) {
    return "Password is required.";
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (value.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }

  return undefined;
};

export const validateLoginForm = (values: {
  email: string;
  password: string;
}): AuthFieldErrors => {
  const errors: AuthFieldErrors = {};

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
};

export const validateRegisterForm = (values: {
  fullName: string;
  email: string;
  password: string;
}): AuthFieldErrors => {
  const errors = validateLoginForm(values);

  if (!normalizeText(values.fullName)) {
    errors.fullName = "Full name is required.";
  } else if (normalizeText(values.fullName).length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  return errors;
};

export const validateVerifyEmailForm = (values: {
  email: string;
  otp: string;
}): AuthFieldErrors => {
  const errors: AuthFieldErrors = {};

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!normalizeText(values.otp)) {
    errors.otp = "Verification code is required.";
  } else if (!/^\d{6}$/.test(values.otp.trim())) {
    errors.otp = "Enter the 6-digit verification code.";
  }

  return errors;
};

export const validateForgotPasswordForm = (values: {
  email: string;
}): AuthFieldErrors => {
  const errors: AuthFieldErrors = {};
  const emailError = validateEmail(values.email);

  if (emailError) {
    errors.email = emailError;
  }

  return errors;
};

export const validateResetPasswordForm = (values: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): AuthFieldErrors => {
  const errors: AuthFieldErrors = {};

  if (!normalizeText(values.token)) {
    errors.newPassword = "This password reset link is invalid or has expired.";
    return errors;
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else {
    const passwordStrengthError = getPasswordStrengthError(values.newPassword);
    if (passwordStrengthError) {
      errors.newPassword = passwordStrengthError;
    }
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};
