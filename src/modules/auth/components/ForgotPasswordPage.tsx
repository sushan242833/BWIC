import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { forgotPassword } from "@/modules/auth/api";
import RecoveryShell from "@/modules/auth/components/RecoveryShell";
import { persistPasswordResetState } from "@/modules/auth/password-reset-storage";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email: normalizedEmail });
      persistPasswordResetState(
        normalizedEmail,
        response.resendCooldownSeconds,
      );
      await router.push(APP_ROUTES.forgotPasswordSent);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to send a reset link right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecoveryShell pageTitle="Forgot Password | Blue Whale Investment">
      <div className="w-full max-w-4xl py-4">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#dbe1ff] text-[#004ac6] shadow-[0_16px_32px_rgba(0,74,198,0.12)]">
            <KeyRound className="h-10 w-10" />
          </div>
          <h1 className="font-auth-headline text-4xl font-extrabold tracking-[-0.06em] text-[#131b2e] sm:text-6xl">
            Reset your password
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#434655] sm:text-[1.35rem]">
            Enter your email address and we&apos;ll send you a secure reset link
            to get back into your account.
          </p>
        </div>

        <div className="auth-recovery-card mx-auto max-w-3xl rounded-[28px] p-8 sm:p-10 lg:p-12">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="text-sm font-semibold tracking-[0.16em] text-[#434655] uppercase"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="bwic@gmail.com"
                  autoComplete="email"
                  className="auth-recovery-input w-full rounded-[18px] border border-transparent px-5 py-4 pr-14 text-lg text-[#131b2e] outline-none placeholder:text-[#737686]"
                  required
                />
                <Mail className="pointer-events-none absolute top-1/2 right-5 h-6 w-6 -translate-y-1/2 text-[#737686]" />
              </div>
              <p className="text-sm leading-6 text-[#737686]">
                We&apos;ll always return the same response to protect account
                privacy.
              </p>
            </div>

            {error && (
              <div className="rounded-[18px] border border-[#ffdad6] bg-[#fff1ef] px-4 py-3 text-sm text-[#93000a]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-recovery-primary-button w-full rounded-[18px] px-6 py-4 text-sm font-bold tracking-[0.22em] text-white uppercase shadow-[0_16px_28px_rgba(0,74,198,0.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-10 border-t border-[#e6e9f8] pt-8 text-center">
            <Link
              href={APP_ROUTES.login}
              className="inline-flex items-center gap-2 text-lg font-medium text-[#004ac6] transition hover:underline"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </RecoveryShell>
  );
}
