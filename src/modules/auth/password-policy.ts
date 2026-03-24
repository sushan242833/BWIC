export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const passwordRequirements = [
  `At least ${PASSWORD_MIN_LENGTH} characters`,
  "One uppercase letter",
  "One lowercase letter",
  "One number",
  "One special character",
];

const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const getPasswordStrengthError = (password: string): string => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }

  if (!strongPasswordPattern.test(password)) {
    return "Password must include uppercase, lowercase, number, and special character.";
  }

  return "";
};
