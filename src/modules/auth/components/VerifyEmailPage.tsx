import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import { resendOtp, verifyEmail } from "@/modules/auth/api";
import RecoveryShell from "@/modules/auth/components/RecoveryShell";
import {
  clearEmailVerificationState,
  persistEmailVerificationState,
  readEmailVerificationState,
} from "@/modules/auth/email-verification-storage";
import { validateVerifyEmailForm } from "@/modules/auth/form-validation";

const formatCountdown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const firstQueryValue = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : value?.[0];

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const maskEmailAddress = (value: string) => {
  const [localPart, domain] = normalizeEmail(value).split("@");

  if (!localPart || !domain) {
    return value;
  }

  const visibleLocal = localPart.slice(0, 1);
  return `${visibleLocal}${"*".repeat(Math.max(localPart.length - 1, 4))}@${domain}`;
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sentAt, setSentAt] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const storedState = readEmailVerificationState();
    const queryEmail = firstQueryValue(router.query.email);
    const resolvedEmail = queryEmail
      ? normalizeEmail(queryEmail)
      : storedState?.email || "";

    if (!resolvedEmail) {
      return;
    }

    setEmail(resolvedEmail);

    if (storedState?.email === resolvedEmail) {
      setSentAt(storedState.sentAt);
      setCooldownSeconds(storedState.resendCooldownSeconds);
      return;
    }

    setSentAt(0);
    setCooldownSeconds(0);
    persistEmailVerificationState({
      email: resolvedEmail,
      sentAt: 0,
      resendCooldownSeconds: 0,
    });
  }, [router.isReady, router.query.email]);

  useEffect(() => {
    if (!sentAt || !cooldownSeconds) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const elapsedSeconds = Math.floor((Date.now() - sentAt) / 1000);
      setRemainingSeconds(Math.max(cooldownSeconds - elapsedSeconds, 0));
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds, sentAt]);

  const maskedEmail = useMemo(() => {
    return email ? maskEmailAddress(email) : "";
  }, [email]);

  const resendLabel = useMemo(() => {
    if (remainingSeconds > 0) {
      return `Resend in ${formatCountdown(remainingSeconds)}`;
    }

    return "Resend OTP";
  }, [remainingSeconds]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateVerifyEmailForm({ email, otp });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields and try again.");
      return;
    }

    setFieldErrors({});
    setError("");
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      await verifyEmail({
        email: normalizedEmail,
        otp,
      });

      clearEmailVerificationState();
      setStatusMessage("Email verified successfully. Redirecting to login...");
      await router.replace(
        `${APP_ROUTES.login}?email=${encodeURIComponent(
          normalizedEmail,
        )}&verified=1`,
      );
    } catch (verificationError) {
      setFieldErrors(getApiFieldErrors(verificationError));
      setError(
        getApiErrorMessage(
          verificationError,
          "Unable to verify your email right now.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || remainingSeconds > 0) {
      return;
    }

    const validationErrors = validateVerifyEmailForm({
      email,
      otp: "000000",
    });

    if (validationErrors.email) {
      setFieldErrors({ email: validationErrors.email });
      setError(validationErrors.email);
      return;
    }

    setFieldErrors((current) => {
      if (!current.email) {
        return current;
      }

      const next = { ...current };
      delete next.email;
      return next;
    });
    setError("");
    setStatusMessage("");
    setIsResending(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await resendOtp({ email: normalizedEmail });
      const nextSentAt = Date.now();

      persistEmailVerificationState({
        email: response.email,
        sentAt: nextSentAt,
        resendCooldownSeconds: response.resendCooldownSeconds,
      });
      setSentAt(nextSentAt);
      setCooldownSeconds(response.resendCooldownSeconds);
      setOtp("");
      setStatusMessage("A fresh verification code has been sent to your email.");
    } catch (resendError) {
      setError(
        getApiErrorMessage(resendError, "Unable to resend the OTP right now."),
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <RecoveryShell pageTitle="Verify Email | Blue Whale Investment">
      <div className="w-full max-w-6xl py-4">
        <div className="auth-recovery-card mx-auto max-w-3xl rounded-[28px] p-8 text-center sm:p-12 lg:p-14">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#eef0ff]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004ac6]/10 text-[#004ac6]">
              <ShieldCheck className="h-9 w-9" />
            </div>
          </div>

          <h1 className="font-auth-headline text-3xl font-bold tracking-[-0.05em] text-[#131b2e] sm:text-4xl">
            Verify your email
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-9 text-[#434655]">
            We have sent a verification code to your email
            {maskedEmail ? ` (${maskedEmail})` : ""}.
          </p>

          {(error || statusMessage) && (
            <div
              className={`mx-auto mt-8 max-w-xl rounded-[18px] px-4 py-3 text-sm ${
                error
                  ? "border border-[#ffdad6] bg-[#fff1ef] text-[#93000a]"
                  : "border border-[#dbe1ff] bg-[#eef0ff] text-[#004ac6]"
              }`}
            >
              {error || statusMessage}
            </div>
          )}

          <form
            className="mx-auto mt-10 flex max-w-xl flex-col gap-5 text-left"
            onSubmit={handleSubmit}
          >
            {!email && (
              <label className="space-y-2">
                <span className="block text-sm font-semibold text-[#131b2e]">
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((current) => {
                      if (!current.email) {
                        return current;
                      }

                      const next = { ...current };
                      delete next.email;
                      return next;
                    });
                    setError("");
                  }}
                  placeholder="user@example.com"
                  className={`w-full rounded-[18px] border px-4 py-4 text-base text-[#131b2e] outline-none transition focus:ring-4 ${
                    fieldErrors.email
                      ? "border-[#ba1a1a] bg-[#fff1ef] focus:ring-[#ba1a1a]/10"
                      : "border-[#d8dff5] bg-white focus:border-[#004ac6] focus:ring-[#004ac6]/10"
                  }`}
                  required
                />
                {fieldErrors.email ? (
                  <p className="text-sm text-[#93000a]">{fieldErrors.email}</p>
                ) : null}
              </label>
            )}

            <label className="space-y-2">
              <span className="block text-sm font-semibold text-[#131b2e]">
                6-digit verification code
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) =>
                  {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setFieldErrors((current) => {
                      if (!current.otp) {
                        return current;
                      }

                      const next = { ...current };
                      delete next.otp;
                      return next;
                    });
                    setError("");
                  }
                }
                placeholder="000000"
                className={`w-full rounded-[18px] border px-4 py-4 text-center font-mono text-2xl tracking-[0.4em] text-[#131b2e] outline-none transition focus:ring-4 ${
                  fieldErrors.otp
                    ? "border-[#ba1a1a] bg-[#fff1ef] focus:ring-[#ba1a1a]/10"
                    : "border-[#d8dff5] bg-white focus:border-[#004ac6] focus:ring-[#004ac6]/10"
                }`}
                maxLength={6}
                required
              />
              {fieldErrors.otp ? (
                <p className="text-sm text-[#93000a]">{fieldErrors.otp}</p>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6 || !email}
              className="w-full rounded-[18px] bg-gradient-to-r from-[#004ac6] to-[#4b41e1] px-6 py-4 text-sm font-bold tracking-[0.22em] text-white uppercase shadow-[0_18px_32px_rgba(0,74,198,0.24)] transition hover:shadow-[0_22px_36px_rgba(0,74,198,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-10 border-t border-[#e6e9f8] pt-8">
            <p className="text-sm text-[#5a6075]">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || remainingSeconds > 0 || !email}
                className="font-semibold text-[#004ac6] transition hover:underline disabled:cursor-not-allowed disabled:text-[#9097b5] disabled:no-underline"
              >
                {isResending ? "Sending..." : resendLabel}
              </button>
            </p>
            <p className="mt-4 text-sm text-[#737686]">
              Already verified your account?{" "}
              <Link
                href={APP_ROUTES.login}
                className="font-semibold text-[#004ac6] hover:underline"
              >
                Return to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </RecoveryShell>
  );
}
