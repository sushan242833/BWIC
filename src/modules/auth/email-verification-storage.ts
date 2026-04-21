const VERIFICATION_EMAIL_KEY = "bwic.email-verification.email";
const VERIFICATION_SENT_AT_KEY = "bwic.email-verification.sent-at";
const VERIFICATION_COOLDOWN_KEY = "bwic.email-verification.cooldown";

export interface EmailVerificationStorageState {
  email: string;
  sentAt: number;
  resendCooldownSeconds: number;
}

export const persistEmailVerificationState = ({
  email,
  sentAt = Date.now(),
  resendCooldownSeconds,
}: EmailVerificationStorageState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(VERIFICATION_EMAIL_KEY, email);
  window.sessionStorage.setItem(VERIFICATION_SENT_AT_KEY, String(sentAt));
  window.sessionStorage.setItem(
    VERIFICATION_COOLDOWN_KEY,
    String(resendCooldownSeconds),
  );
};

export const readEmailVerificationState =
  (): EmailVerificationStorageState | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const email = window.sessionStorage.getItem(VERIFICATION_EMAIL_KEY);
    const sentAt = Number(window.sessionStorage.getItem(VERIFICATION_SENT_AT_KEY));
    const resendCooldownSeconds = Number(
      window.sessionStorage.getItem(VERIFICATION_COOLDOWN_KEY),
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

export const clearEmailVerificationState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(VERIFICATION_EMAIL_KEY);
  window.sessionStorage.removeItem(VERIFICATION_SENT_AT_KEY);
  window.sessionStorage.removeItem(VERIFICATION_COOLDOWN_KEY);
};
