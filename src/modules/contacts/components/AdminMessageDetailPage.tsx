import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Filter,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { getContactMessage } from "@/modules/contacts/api";
import {
  formatContactDateTime,
  formatInvestmentRange,
  formatPropertyType,
} from "@/modules/contacts/display";
import type { ContactMessage } from "@/modules/contacts/types";

export default function AdminMessageDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMessage = async (options?: { silent?: boolean }) => {
    if (!id || Array.isArray(id)) {
      return;
    }

    const silent = options?.silent ?? false;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMsg(null);

    try {
      const contact = await getContactMessage(id);
      setMessage(contact);
    } catch (error) {
      console.error("Failed to fetch contact inquiry:", error);
      setErrorMsg(
        error instanceof Error ? error.message : "Failed to load inquiry.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    void fetchMessage();
  }, [router.isReady, id]);

  if (loading) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-[0_24px_70px_rgba(19,27,46,0.08)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#0f766e] border-t-transparent" />
          <p className="mt-5 text-base font-medium text-[#4e5a73]">
            Loading inquiry details...
          </p>
        </div>
      </section>
    );
  }

  if (errorMsg || !message) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] bg-white px-6 py-12 text-center shadow-[0_24px_70px_rgba(19,27,46,0.08)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#b42318]">
            Inquiry Error
          </p>
          <h2 className="mt-4 font-auth-headline text-3xl font-bold text-[#131b2e]">
            Unable to load this inquiry
          </h2>
          <p className="mt-3 text-base text-[#5b6275]">
            {errorMsg ?? "The requested inquiry could not be found."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void fetchMessage()}
              className="inline-flex items-center justify-center rounded-2xl bg-[#177245] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#125c38]"
            >
              Retry
            </button>
            <Link
              href={APP_ROUTES.adminMessages}
              className="inline-flex items-center justify-center rounded-2xl border border-[#d7def4] px-5 py-3 text-sm font-semibold text-[#1b2236] transition hover:bg-[#f7f9ff]"
            >
              Back to Messages
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={APP_ROUTES.adminMessages}
            className="inline-flex items-center gap-3 self-start rounded-2xl border border-[#d8dce8] bg-white px-5 py-3 text-sm font-semibold text-[#1b2236] shadow-[0_16px_40px_rgba(19,27,46,0.05)] transition hover:bg-[#f7f8fb]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Link>

          <button
            type="button"
            onClick={() => void fetchMessage({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-3 self-start rounded-2xl border border-[#d8dce8] bg-white px-5 py-3 text-sm font-semibold text-[#1b2236] shadow-[0_16px_40px_rgba(19,27,46,0.05)] transition hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Inquiry
          </button>
        </div>

        <div className="mt-6 rounded-[2rem] border border-[#e8ebf3] bg-white px-6 py-8 shadow-[0_24px_70px_rgba(19,27,46,0.06)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b7280]">
                Inquiry Details
              </p>
              <h1 className="mt-4 font-auth-headline text-[2.2rem] font-bold leading-tight text-[#131b2e] sm:text-[2.8rem]">
                {message.name}
              </h1>
              <p className="mt-4 text-base leading-7 text-[#5b6275]">
                Review the sender&apos;s contact information and their message
                in the same clean admin style used across the rest of the panel.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <div className="rounded-[1.4rem] border border-[#eceff5] bg-[#fafbfc] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a8498]">
                  Received
                </p>
                <p className="mt-2 text-sm font-semibold text-[#172033]">
                  {formatContactDateTime(message.createdAt)}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-[#dcefe1] bg-[#f3fbf5] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4f7a5c]">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold text-[#177245]">
                  New Inquiry
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#eef1f7] px-3 py-1 text-xs font-semibold text-[#374151]">
              {formatPropertyType(message.propertyType)}
            </span>
            <span className="rounded-full bg-[#f3fbf5] px-3 py-1 text-xs font-semibold text-[#177245]">
              {formatInvestmentRange(message.investmentRange)}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.6rem] border border-[#e8ebf3] bg-white p-5 shadow-[0_18px_45px_rgba(19,27,46,0.05)]">
            <div className="flex items-center gap-3 text-[#177245]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3fbf5]">
                <Mail className="h-5 w-5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6a7287]">
                Email
              </p>
            </div>
            <a
              href={`mailto:${message.email}`}
              className="mt-4 block break-all text-[1.05rem] font-semibold text-[#131b2e] transition hover:text-[#177245]"
            >
              {message.email}
            </a>
          </article>

          <article className="rounded-[1.6rem] border border-[#e8ebf3] bg-white p-5 shadow-[0_18px_45px_rgba(19,27,46,0.05)]">
            <div className="flex items-center gap-3 text-[#177245]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3fbf5]">
                <Phone className="h-5 w-5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6a7287]">
                Phone
              </p>
            </div>
            {message.phone?.trim() ? (
              <a
                href={`tel:${message.phone}`}
                className="mt-4 block text-[1.05rem] font-semibold text-[#131b2e] transition hover:text-[#177245]"
              >
                {message.phone}
              </a>
            ) : (
              <p className="mt-4 text-[1.05rem] font-semibold text-[#8c97b0]">
                Not provided
              </p>
            )}
          </article>

          <article className="rounded-[1.6rem] border border-[#e8ebf3] bg-white p-5 shadow-[0_18px_45px_rgba(19,27,46,0.05)]">
            <div className="flex items-center gap-3 text-[#177245]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3fbf5]">
                <Filter className="h-5 w-5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6a7287]">
                Service
              </p>
            </div>
            <p className="mt-4 text-[1.05rem] font-semibold text-[#131b2e]">
              {formatPropertyType(message.propertyType)}
            </p>
          </article>

          <article className="rounded-[1.6rem] border border-[#e8ebf3] bg-white p-5 shadow-[0_18px_45px_rgba(19,27,46,0.05)]">
            <div className="flex items-center gap-3 text-[#177245]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3fbf5]">
                <CalendarDays className="h-5 w-5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6a7287]">
                Received
              </p>
            </div>
            <p className="mt-4 text-[1.05rem] font-semibold text-[#131b2e]">
              {formatContactDateTime(message.createdAt)}
            </p>
          </article>
        </div>

        <div className="mt-6 rounded-[2rem] border border-[#e8ebf3] bg-white p-6 shadow-[0_18px_45px_rgba(19,27,46,0.05)]">
          <div className="flex items-center gap-3 text-[#177245]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3fbf5]">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6a7287]">
              Message
            </p>
          </div>
          <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-[#30394d]">
            {message.message?.trim() ||
              "No additional message was included with this inquiry."}
          </p>
        </div>
      </div>
    </section>
  );
}
