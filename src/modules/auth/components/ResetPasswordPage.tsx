import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  LockKeyhole,
  TriangleAlert,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { resetPassword, validateResetToken } from "@/modules/auth/api";
import RecoveryShell from "@/modules/auth/components/RecoveryShell";
import {
  getPasswordStrengthError,
  PASSWORD_MIN_LENGTH,
} from "@/modules/auth/password-policy";
import { clearPasswordResetState } from "@/modules/auth/password-reset-storage";

type TokenStatus = "checking" | "valid" | "invalid";

const formatExpiresAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getPasswordRequirementChecks = (password: string) => [
  {
    label: `Min. ${PASSWORD_MIN_LENGTH} characters`,
    met: password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    label: "Include a number",
    met: /\d/.test(password),
  },
  {
    label: "Upper & lowercase",
    met: /[A-Z]/.test(password) && /[a-z]/.test(password),
  },
  {
    label: "Special character",
    met: /[^A-Za-z\d]/.test(password),
  },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  const [tokenMessage, setTokenMessage] = useState(
    "Validating your reset link...",
  );
  const [expiresAt, setExpiresAt] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const tokenParam =
      typeof router.query.token === "string" ? router.query.token : "";

    if (!tokenParam) {
      setTokenStatus("invalid");
      setTokenMessage("This password reset link is missing or invalid.");
      return;
    }

    let isActive = true;
    setToken(tokenParam);
    setTokenStatus("checking");
    setTokenMessage("Validating your reset link...");

    void validateResetToken(tokenParam)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setExpiresAt(response.expiresAt);
        setTokenStatus("valid");
        setTokenMessage("");
      })
      .catch((validationError) => {
        if (!isActive) {
          return;
        }

        setTokenStatus("invalid");
        setTokenMessage(
          validationError instanceof Error
            ? validationError.message
            : "This password reset link is invalid or has expired.",
        );
      });

    return () => {
      isActive = false;
    };
  }, [router.isReady, router.query.token]);

  const passwordHint = useMemo(
    () => getPasswordStrengthError(newPassword),
    [newPassword],
  );
  const requirementChecks = useMemo(
    () => getPasswordRequirementChecks(newPassword),
    [newPassword],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const strengthError = getPasswordStrengthError(newPassword);

    if (strengthError) {
      setError(strengthError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      clearPasswordResetState();
      setSuccess("Password reset successful. Redirecting you to login...");

      window.setTimeout(() => {
        void router.replace(APP_ROUTES.login);
      }, 1800);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to reset your password right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenStatus === "checking") {
    return (
      <RecoveryShell
        pageTitle="Reset Password | Blue Whale Investment"
        variant="minimalLegal"
      >
        <div className="mx-auto w-full max-w-lg">
          <div className="auth-recovery-card rounded-[28px] border border-[#c3c6d7]/15 bg-white/84 p-10 text-center shadow-[0_20px_40px_rgba(19,27,46,0.06)] backdrop-blur-[24px] sm:p-12">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[#004ac6] border-t-transparent" />
            <h1 className="font-auth-headline text-3xl font-bold tracking-[-0.05em] text-[#131b2e]">
              Checking your link
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#434655]">
              {tokenMessage}
            </p>
          </div>
        </div>
      </RecoveryShell>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <RecoveryShell
        pageTitle="Reset Password | Blue Whale Investment"
        variant="minimalLegal"
      >
        <div className="mx-auto w-full max-w-xl">
          <div className="auth-recovery-card rounded-[28px] border border-[#c3c6d7]/15 bg-white/84 p-8 text-center shadow-[0_20px_40px_rgba(19,27,46,0.06)] backdrop-blur-[24px] sm:p-10">
            <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#fff1ef] text-[#ba1a1a]">
              <TriangleAlert className="h-10 w-10" />
            </div>
            <h1 className="font-auth-headline text-4xl font-extrabold tracking-[-0.06em] text-[#131b2e] sm:text-5xl">
              Reset link unavailable
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-[#434655]">
              {tokenMessage}
            </p>

            <p className="mt-6 text-base leading-8 text-[#5a6075]">
              Request a fresh password reset link and try again.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={APP_ROUTES.forgotPassword}
                className="auth-recovery-primary-button flex-1 rounded-[16px] px-6 py-4 text-sm font-bold tracking-[0.22em] text-white uppercase shadow-[0_16px_28px_rgba(0,74,198,0.24)] transition hover:scale-[1.01]"
              >
                Request New Link
              </Link>
              <Link
                href={APP_ROUTES.login}
                className="flex-1 rounded-[16px] border border-[#c3c6d7] px-6 py-4 text-sm font-bold tracking-[0.22em] text-[#131b2e] uppercase transition hover:border-[#004ac6]/30 hover:bg-[#f6f7ff]"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </RecoveryShell>
    );
  }

  return (
    <RecoveryShell
      pageTitle="Create New Password | Blue Whale Investment"
      variant="minimalLegal"
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="auth-recovery-card rounded-[28px] border border-[#c3c6d7]/15 bg-white/84 p-8 shadow-[0_20px_40px_rgba(19,27,46,0.06)] backdrop-blur-[24px] sm:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eef0ff]">
              <LockKeyhole className="h-8 w-8 text-[#004ac6]" />
            </div>
            <h1 className="font-auth-headline text-4xl font-extrabold tracking-[-0.05em] text-[#131b2e] sm:text-5xl">
              Create New Password
            </h1>
            <p className="mt-4 max-w-md text-lg leading-9 text-[#30374a]">
              Please enter your new password below. Ensure it is at least 8
              characters long and includes a mix of letters and numbers.
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold tracking-[0.16em] text-[#2d3447] uppercase"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-[16px] border border-transparent bg-[#eef0ff] px-5 py-4 pr-14 text-lg text-[#131b2e] outline-none transition placeholder:text-[#9aa1b8] focus:border-[#dbe1ff] focus:ring-4 focus:ring-[#004ac6]/12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((current) => !current)}
                  className="absolute top-1/2 right-5 -translate-y-1/2 text-[#434655] transition hover:text-[#004ac6]"
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold tracking-[0.16em] text-[#2d3447] uppercase"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-[16px] border border-transparent bg-[#eef0ff] px-5 py-4 pr-14 text-lg text-[#131b2e] outline-none transition placeholder:text-[#9aa1b8] focus:border-[#dbe1ff] focus:ring-4 focus:ring-[#004ac6]/12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute top-1/2 right-5 -translate-y-1/2 text-[#434655] transition hover:text-[#004ac6]"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-[18px] bg-[#eef0ff]/80 p-5">
              <p className="text-lg font-semibold text-[#131b2e]">
                Password Requirements:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {requirementChecks.map((requirement) => (
                  <div
                    key={requirement.label}
                    className="flex items-center gap-2 text-[0.95rem] text-[#30374a]"
                  >
                    {requirement.met ? (
                      <CheckCircle2 className="h-4 w-4 text-[#004ac6]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#a4abc4]" />
                    )}
                    <span>{requirement.label}</span>
                  </div>
                ))}
              </div>
              {expiresAt && (
                <p className="mt-4 text-sm text-[#6f768e]">
                  This link expires on {formatExpiresAt(expiresAt)}.
                </p>
              )}
            </div>

            {!error && !success && passwordHint && newPassword && (
              <div className="rounded-[16px] border border-[#ffdad6] bg-[#fff1ef] px-4 py-3 text-sm text-[#93000a]">
                {passwordHint}
              </div>
            )}

            {error && (
              <div className="rounded-[16px] border border-[#ffdad6] bg-[#fff1ef] px-4 py-3 text-sm text-[#93000a]">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-[16px] border border-[#dbe1ff] bg-[#eef0ff] px-4 py-3 text-sm text-[#004ac6]">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || Boolean(success)}
              className="auth-recovery-primary-button flex w-full items-center justify-center gap-2 rounded-[16px] px-6 py-4 text-sm font-bold tracking-[0.22em] text-white uppercase shadow-[0_16px_28px_rgba(0,74,198,0.24)] transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 border-t border-[#e6e9f8] pt-8 text-center">
            <Link
              href={APP_ROUTES.login}
              className="inline-flex items-center gap-2 text-lg font-medium text-[#004ac6] transition hover:underline"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </RecoveryShell>
  );
}
