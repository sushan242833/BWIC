import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { MailCheck } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { getApiErrorMessage } from "@/lib/api/errors";
import { forgotPassword } from "@/modules/auth/api";
import RecoveryShell from "@/modules/auth/components/RecoveryShell";
import {
  persistPasswordResetState,
  readPasswordResetState,
} from "@/modules/auth/password-reset-storage";

const formatCountdown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function ForgotPasswordSentPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sentAt, setSentAt] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const state = readPasswordResetState();

    if (!state) {
      return;
    }

    setEmail(state.email);
    setSentAt(state.sentAt);
    setCooldownSeconds(state.resendCooldownSeconds);
  }, []);

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

  const resendLabel = useMemo(() => {
    if (remainingSeconds > 0) {
      return `Resend in ${formatCountdown(remainingSeconds)}`;
    }

    return "Resend link";
  }, [remainingSeconds]);

  const handleResend = async () => {
    if (!email) {
      await router.push(APP_ROUTES.forgotPassword);
      return;
    }

    if (remainingSeconds > 0) {
      return;
    }

    setError("");
    setStatusMessage("");
    setIsResending(true);

    try {
      const response = await forgotPassword({ email });
      persistPasswordResetState(email, response.resendCooldownSeconds);
      setSentAt(Date.now());
      setCooldownSeconds(response.resendCooldownSeconds);
      setStatusMessage(
        "If an account exists, a password reset link has been sent.",
      );
    } catch (resendError) {
      setError(
        getApiErrorMessage(
          resendError,
          "Unable to resend the reset link right now.",
        ),
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <RecoveryShell pageTitle="Check Your Email | Blue Whale Investment">
      <div className="w-full max-w-6xl py-4">
        <div className="auth-recovery-card mx-auto max-w-3xl rounded-[28px] p-8 text-center sm:p-12 lg:p-14">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#eef0ff]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004ac6]/10 text-[#004ac6]">
              <MailCheck className="h-9 w-9" />
            </div>
          </div>

          <h1 className="font-auth-headline text-3xl font-bold tracking-[-0.05em] text-[#131b2e] sm:text-4xl">
            Check your email
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-9 text-[#434655]">
            We&apos;ve sent a password reset link to your email. Please check
            your inbox and follow the instructions.
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

          <div className="mt-10 flex flex-col gap-4">
            <Link
              href={APP_ROUTES.login}
              className="w-full rounded-[18px] border-2 border-[#bcc4dc] px-6 py-4 text-sm font-bold tracking-[0.22em] text-[#131b2e] uppercase transition hover:border-[#004ac6]/30 hover:bg-[#f6f7ff]"
            >
              Return to Login
            </Link>
          </div>

          <div className="mt-10 border-t border-[#e6e9f8] pt-8">
            <p className="text-sm text-[#5a6075]">
              Didn&apos;t receive an email?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || remainingSeconds > 0}
                className="font-semibold text-[#004ac6] transition hover:underline disabled:cursor-not-allowed disabled:text-[#9097b5] disabled:no-underline"
              >
                {isResending ? "Sending..." : resendLabel}
              </button>
            </p>
          </div>
        </div>
      </div>
    </RecoveryShell>
  );
}
