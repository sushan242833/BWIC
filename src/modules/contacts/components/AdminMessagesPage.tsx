import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Filter, Inbox, RefreshCw, Search } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { getContactMessages } from "@/modules/contacts/api";
import {
  buildMessagePreview,
  formatContactDate,
  formatInvestmentRange,
  formatPropertyType,
} from "@/modules/contacts/display";
import type { ContactMessage } from "@/modules/contacts/types";

const searchFieldClassName =
  "h-14 w-full rounded-2xl border border-transparent bg-[#dfe5ff] px-5 text-[1rem] font-medium text-[#131b2e] outline-none transition placeholder:text-[#5b6275] focus:border-[#b9c8ff] focus:bg-white focus:ring-4 focus:ring-[#004ac6]/10";

const selectFieldClassName =
  "h-14 w-full appearance-none rounded-2xl border border-transparent bg-[#dfe5ff] px-5 pr-12 text-[1rem] font-medium text-[#131b2e] outline-none transition focus:border-[#b9c8ff] focus:bg-white focus:ring-4 focus:ring-[#004ac6]/10";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMessages = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMsg(null);

    try {
      const contacts = await getContactMessages();
      const sortedContacts = [...contacts].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );

      setMessages(sortedContacts);
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Failed to load contact messages.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredMessages = messages.filter((message) => {
    const matchesProperty =
      !propertyFilter || message.propertyType === propertyFilter;

    if (!matchesProperty) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableFields = [
      message.name,
      message.email,
      message.phone ?? "",
      formatPropertyType(message.propertyType),
      formatInvestmentRange(message.investmentRange),
      message.message ?? "",
    ];

    return searchableFields.some((field) =>
      field.toLowerCase().includes(normalizedQuery),
    );
  });

  const propertyTypeOptions = Array.from(
    new Set(messages.map((message) => message.propertyType).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));

  if (errorMsg && !messages.length) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(19,27,46,0.08)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#b42318]">
            Inbox Error
          </p>
          <h2 className="mt-4 font-auth-headline text-3xl font-bold text-[#131b2e]">
            Unable to load messages
          </h2>
          <p className="mt-3 text-base text-[#5b6275]">{errorMsg}</p>
          <button
            type="button"
            onClick={() => void fetchMessages()}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#004ac6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003da4]"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mt-8 rounded-[2rem] bg-white p-5 shadow-[0_24px_70px_rgba(19,27,46,0.06)] sm:p-7">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <label className="block">
              <span className="mb-3 ml-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-[#1b2236]">
                Search Inbox
              </span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5b6275]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name, email, phone, or message..."
                  className={`${searchFieldClassName} pl-14`}
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-3 ml-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-[#1b2236]">
                Service of Interest
              </span>
              <div className="relative">
                <select
                  value={propertyFilter}
                  onChange={(event) => setPropertyFilter(event.target.value)}
                  className={selectFieldClassName}
                >
                  <option value="">All Services</option>
                  {propertyTypeOptions.map((propertyType) => (
                    <option key={propertyType} value={propertyType}>
                      {formatPropertyType(propertyType)}
                    </option>
                  ))}
                </select>
                <Filter className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5b6275]" />
              </div>
            </label>
          </div>

          {errorMsg ? (
            <div className="mt-5 rounded-2xl border border-[#ffd4d1] bg-[#fff5f4] px-5 py-4 text-sm text-[#a2372c]">
              {errorMsg}
            </div>
          ) : null}

          <div className="mt-6 max-h-[920px] space-y-4 overflow-y-auto pr-1">
            {loading
              ? Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={`message-skeleton-${index}`}
                    className="rounded-[1.6rem] border border-[#ebefff] bg-[#f7f8ff] p-5"
                  >
                    <div className="h-5 w-40 animate-pulse rounded-full bg-[#dfe5ff]" />
                    <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-[#ebefff]" />
                    <div className="mt-5 h-4 w-full animate-pulse rounded-full bg-[#eef2ff]" />
                    <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-[#eef2ff]" />
                  </div>
                ))
              : null}

            {!loading && filteredMessages.length === 0 ? (
              <div className="rounded-[1.8rem] border border-dashed border-[#d8def4] bg-[#f9faff] px-6 py-14 text-center">
                <Inbox className="mx-auto h-10 w-10 text-[#8c97b0]" />
                <h2 className="mt-4 font-auth-headline text-2xl font-semibold text-[#131b2e]">
                  No messages found
                </h2>
                <p className="mt-3 text-base text-[#5b6275]">
                  Try adjusting the search or service filter to find a different
                  inquiry.
                </p>
              </div>
            ) : null}

            {!loading
              ? filteredMessages.map((message) => (
                  <Link
                    key={message.id}
                    href={APP_ROUTES.adminMessageDetail(message.id)}
                    className="block rounded-[1.6rem] border border-[#edf0fb] bg-[#fbfcff] p-5 text-left transition hover:border-[#d4ddff] hover:bg-white hover:shadow-[0_16px_35px_rgba(0,74,198,0.08)]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate font-auth-headline text-[1.5rem] font-semibold leading-tight text-[#131b2e]">
                          {message.name}
                        </h3>
                        <p className="mt-1 truncate text-sm text-[#5b6275]">
                          {message.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#004ac6]">
                          {formatContactDate(message.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#dce6ff] px-3 py-1 text-xs font-semibold text-[#0d47b8]">
                        {formatPropertyType(message.propertyType)}
                      </span>
                      <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-xs font-semibold text-[#47536b]">
                        {formatInvestmentRange(message.investmentRange)}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-[#434655]">
                      {buildMessagePreview(message.message)}
                    </p>
                  </Link>
                ))
              : null}
          </div>
        </div>
      </div>
    </section>
  );
}
