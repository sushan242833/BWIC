import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { APP_ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { AuthUser, USER_ROLE, UserRole } from "@/modules/auth/types";

type AuthPageMode = "login" | "register";

interface AuthPageProps {
  mode: AuthPageMode;
  portal?: UserRole;
}

const safeRedirect = (value: string | string[] | undefined) => {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
};

const resolveLandingPath = (
  user: AuthUser,
  portal: UserRole | undefined,
  requestedRedirect: string | undefined,
) => {
  if (portal === USER_ROLE.ADMIN) {
    return requestedRedirect?.startsWith(APP_ROUTES.adminDashboard)
      ? requestedRedirect
      : APP_ROUTES.adminDashboard;
  }

  if (
    requestedRedirect &&
    !requestedRedirect.startsWith(APP_ROUTES.adminDashboard)
  ) {
    return requestedRedirect;
  }

  return user.role === USER_ROLE.ADMIN
    ? APP_ROUTES.adminDashboard
    : APP_ROUTES.home;
};

export default function AuthPage({
  mode,
  portal = USER_ROLE.USER,
}: AuthPageProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";
  const isAdminLogin = mode === "login" && portal === USER_ROLE.ADMIN;
  const requestedRedirect = safeRedirect(router.query.redirect);

  const pageCopy = useMemo(() => {
    if (isRegister) {
      return {
        title: "Create your investor account",
        subtitle:
          "Start building your Blue Whale profile for future portfolio tools.",
        submitLabel: "Create Account",
        footer: (
          <p className="text-sm text-[#434655]">
            Already have an account?
            <Link
              href={APP_ROUTES.login}
              className="ml-1 font-semibold text-[#004ac6] hover:underline"
            >
              Sign in
            </Link>
          </p>
        ),
      };
    }

    return {
      title: "Access your investment portfolio portal",
      subtitle: "Access your investment portfolio portal",
      submitLabel: "Login to Portal",
      footer: isAdminLogin ? null : (
        <p className="text-sm text-[#434655]">
          Don't have an account?
          <Link
            href={APP_ROUTES.register}
            className="ml-1 font-semibold text-[#004ac6] hover:underline"
          >
            Create one now
          </Link>
        </p>
      ),
    };
  }, [isAdminLogin, isRegister]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser = isRegister
        ? await register({
            fullName,
            email,
            password,
            rememberMe,
          })
        : await login({
            email,
            password,
            rememberMe,
            scope: isAdminLogin ? USER_ROLE.ADMIN : undefined,
          });

      await router.replace(
        resolveLandingPath(
          authenticatedUser,
          isAdminLogin ? USER_ROLE.ADMIN : undefined,
          requestedRedirect,
        ),
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to complete your request right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>
          {isRegister
            ? "Register | Blue Whale Investment"
            : isAdminLogin
              ? "Admin Login | Blue Whale Investment"
              : "Login | Blue Whale Investment"}
        </title>
      </Head>

      <main className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
        <div className="flex min-h-screen flex-col md:flex-row">
          <section className="auth-hero  hidden md:flex md:w-1/2">
            <div className="flex h-full w-full flex-col justify-center p-10 lg:p-16">
              <div className="max-w-xl">
                <span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] text-white uppercase backdrop-blur-sm">
                  Established Authority
                </span>
                <h1 className="font-auth-headline mb-8 text-5xl leading-[0.92] font-extrabold tracking-[-0.05em] text-white lg:text-7xl">
                  Secure.
                  <br />
                  Transparent.
                  <br />
                  Profitable.
                </h1>
                <p className="max-w-lg text-xl leading-relaxed text-white/80">
                  Welcome to the future of real estate investment in Nepal. Your
                  gateway to premium institutional-grade assets.
                </p>
              </div>
            </div>
          </section>

          <section className="relative flex flex-1 items-center justify-center bg-white px-6 py-10 sm:px-8 lg:px-24">
            <div className="w-full max-w-md">
              <div className="mb-12 text-center md:text-left">
                <Link
                  href="/"
                  className="font-auth-headline mb-2 inline-block text-2xl font-extrabold tracking-[-0.04em] text-[#131b2e]"
                >
                  Blue Whale Investment
                </Link>
                <p className="text-sm text-[#434655]">{pageCopy.subtitle}</p>
              </div>

              {!isRegister && (
                <div className="mb-10 flex rounded-xl bg-[#eef0ff] p-1.5">
                  <Link
                    href={APP_ROUTES.login}
                    className={`flex-1 rounded-lg px-4 py-3 text-center text-sm transition-all ${
                      !isAdminLogin
                        ? "bg-white font-semibold text-[#004ac6] shadow-sm"
                        : "font-medium text-[#434655] hover:text-[#131b2e]"
                    }`}
                  >
                    User Login
                  </Link>
                  <Link
                    href={APP_ROUTES.adminLogin}
                    className={`flex-1 rounded-lg px-4 py-3 text-center text-sm transition-all ${
                      isAdminLogin
                        ? "bg-white font-semibold text-[#004ac6] shadow-sm"
                        : "font-medium text-[#434655] hover:text-[#131b2e]"
                    }`}
                  >
                    Admin Login
                  </Link>
                </div>
              )}

              {isRegister && (
                <div className="mb-10 flex rounded-xl bg-[#eef0ff] p-1.5">
                  <span className="flex-1 rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-[#004ac6] shadow-sm">
                    Create Account
                  </span>
                  <Link
                    href={APP_ROUTES.login}
                    className="flex-1 rounded-lg px-4 py-3 text-center text-sm font-medium text-[#434655] transition-all hover:text-[#131b2e]"
                  >
                    User Login
                  </Link>
                </div>
              )}

              <div className="mb-8">
                <h2 className="font-auth-headline text-3xl font-bold tracking-[-0.04em] text-[#131b2e]">
                  {pageCopy.title}
                </h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {isRegister && (
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-semibold text-[#131b2e]"
                      htmlFor="fullName"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-lg bg-[#dae2fd] px-4 py-3.5 text-[#131b2e] outline-none transition focus:ring-2 focus:ring-[#004ac6]/20"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold text-[#131b2e]"
                    htmlFor="email"
                  >
                    Email or Username
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="bwic@gmail.com"
                    className="w-full rounded-lg bg-[#dae2fd] px-4 py-3.5 text-[#131b2e] outline-none transition placeholder:text-[#8c93ad] focus:ring-2 focus:ring-[#004ac6]/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-sm font-semibold text-[#131b2e]"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    {!isRegister && (
                      <Link
                        href={APP_ROUTES.forgotPassword}
                        className="text-xs font-semibold text-[#004ac6] hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg bg-[#dae2fd] px-4 py-3.5 pr-12 text-[#131b2e] outline-none transition placeholder:text-[#8c93ad] focus:ring-2 focus:ring-[#004ac6]/20"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-[#8c93ad] transition hover:text-[#131b2e]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm font-medium text-[#434655]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]/30"
                  />
                  Stay signed in for 30 days
                </label>

                {error && (
                  <div className="rounded-lg border border-[#ffdad6] bg-[#fff1ef] px-4 py-3 text-sm text-[#93000a]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-gradient-to-r from-[#004ac6] to-[#4b41e1] px-4 py-4 text-xs font-bold tracking-[0.24em] text-white uppercase shadow-[0_12px_24px_rgba(0,74,198,0.24)] transition hover:shadow-[0_18px_28px_rgba(0,74,198,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Please wait..." : pageCopy.submitLabel}
                </button>
              </form>

              {pageCopy.footer && (
                <div className="mt-12 border-t border-[#e2e7ff] pt-8 text-center">
                  {pageCopy.footer}
                </div>
              )}
            </div>

            <div className="absolute right-0 bottom-6 left-0 flex items-center justify-between px-6 text-[10px] font-bold tracking-[0.22em] text-[#b0b6d0] uppercase sm:px-8 lg:px-10">
              <span>&copy; 2026 Blue Whale Investment</span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
