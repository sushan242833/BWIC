import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";

interface AuthRequiredModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

const AuthRequiredModal = ({
  isOpen,
  title = "Sign in to save favorites",
  message = "Create an account or log in to save properties to your favorites and access them anytime.",
  onClose,
}: AuthRequiredModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-required-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Account required
            </p>
            <h2
              id="auth-required-title"
              className="mt-2 text-2xl font-bold text-slate-950"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href={APP_ROUTES.register}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={onClose}
          >
            Go to Sign Up
          </Link>
          <Link
            href={APP_ROUTES.login}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-600 hover:text-blue-700"
            onClick={onClose}
          >
            Log In
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
