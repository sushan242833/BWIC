const RESET_EMAIL_KEY = "bwic.password-reset.email";
const RESET_SENT_AT_KEY = "bwic.password-reset.sent-at";
const RESET_COOLDOWN_KEY = "bwic.password-reset.cooldown";

export interface PasswordResetStorageState {
  email: string;
  sentAt: number;
  resendCooldownSeconds: number;
}

export const persistPasswordResetState = (
  email: string,
  resendCooldownSeconds: number,
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(RESET_EMAIL_KEY, email);
  window.sessionStorage.setItem(RESET_SENT_AT_KEY, String(Date.now()));
  window.sessionStorage.setItem(
    RESET_COOLDOWN_KEY,
    String(resendCooldownSeconds),
  );
};

export const readPasswordResetState =
  (): PasswordResetStorageState | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const email = window.sessionStorage.getItem(RESET_EMAIL_KEY);
    const sentAt = Number(window.sessionStorage.getItem(RESET_SENT_AT_KEY));
    const resendCooldownSeconds = Number(
      window.sessionStorage.getItem(RESET_COOLDOWN_KEY),
    );

    if (
      !email ||
      !Number.isFinite(sentAt) ||
      !Number.isFinite(resendCooldownSeconds)
    ) {
      return null;
    }

    return {
      email,
      sentAt,
      resendCooldownSeconds,
    };
  };

export const clearPasswordResetState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(RESET_EMAIL_KEY);
  window.sessionStorage.removeItem(RESET_SENT_AT_KEY);
  window.sessionStorage.removeItem(RESET_COOLDOWN_KEY);
};
