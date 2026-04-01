import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, PlusCircle, Shapes, type LucideIcon } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { getApiData } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/routes";
import { getContactMessages } from "@/modules/contacts/api";
import type { ContactMessage } from "@/modules/contacts/types";

interface StatsResponse {
  totalProperties: number;
  totalCategories: number;
}

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
}

const quickActions: QuickAction[] = [
  {
    label: "Add New Property",
    href: APP_ROUTES.adminAddProperty,
    icon: PlusCircle,
    primary: true,
  },
  {
    label: "Categories",
    href: APP_ROUTES.adminCategories,
    icon: Shapes,
  },
  {
    label: "Messages",
    href: APP_ROUTES.adminMessages,
    icon: Mail,
  },
];

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const buildSubject = (contact: ContactMessage): string => {
  const message = contact.message?.trim();

  if (message) {
    return message.length > 60 ? `${message.slice(0, 57)}...` : message;
  }

  return `Inquiry about ${contact.propertyType}`;
};

const summaryCardStyles = [
  {
    label: "Total Properties",
    accent: "Live",
    accentClassName: "text-emerald-600",
    formatValue: (value: number) => `${value}`,
  },
  {
    label: "Total Categories",
    accent: "Stable",
    accentClassName: "text-[#8a97b2]",
    formatValue: (value: number) => `${value}`,
  },
] as const;

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResponse>({
    totalProperties: 0,
    totalCategories: 0,
  });
  const [recentContacts, setRecentContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [summary, contacts] = await Promise.all([
          getApiData<StatsResponse>(API_ENDPOINTS.stats.summary),
          getContactMessages(),
        ]);

        if (!isMounted) {
          return;
        }

        const sortedContacts = [...contacts]
          .sort(
            (left, right) =>
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime(),
          )
          .slice(0, 4);

        setStats(summary);
        setRecentContacts(sortedContacts);
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
        if (isMounted) {
          setError("Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-6.25rem)] items-center justify-center px-6">
        <div className="rounded-[28px] border border-[#e8ebf8] bg-white px-10 py-9 text-center shadow-[0_24px_70px_rgba(19,27,46,0.05)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#004ac6] border-t-transparent" />
          <p className="mt-5 text-base font-medium text-[#4e5a73]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-6.25rem)] items-center justify-center px-6">
        <div className="max-w-md rounded-[28px] border border-[#ffd9d6] bg-white px-8 py-8 shadow-[0_24px_70px_rgba(19,27,46,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ba1a1a]">
            Dashboard Error
          </p>
          <h2 className="mt-4 font-auth-headline text-3xl font-bold text-[#131b2e]">
            Something went wrong
          </h2>
          <p className="mt-3 text-base text-[#5f6b84]">{error}</p>
        </div>
      </div>
    );
  }

  const summaryValues = [
    stats.totalProperties,
    stats.totalCategories,
  ] as const;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
      <section className="flex flex-wrap items-center gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const className = action.primary
            ? "border-[#0f49cc] bg-[#1550cf] text-white shadow-[0_20px_35px_rgba(21,80,207,0.22)] hover:bg-[#0f49cc]"
            : "border-[#e4e7f2] bg-white text-[#1d2438] hover:bg-[#f8f9ff]";

          const content = (
            <>
              <Icon className="h-5 w-5" />
              <span>{action.label}</span>
            </>
          );

          return action.href.startsWith("#") ? (
            <a
              key={action.label}
              href={action.href}
              className={`inline-flex h-16 items-center gap-3 rounded-2xl border px-6 text-lg font-semibold transition ${className}`}
            >
              {content}
            </a>
          ) : (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex h-16 items-center gap-3 rounded-2xl border px-6 text-lg font-semibold transition ${className}`}
            >
              {content}
            </Link>
          );
        })}
      </section>

      <section className="mt-12 grid gap-6 xl:grid-cols-2">
        {summaryCardStyles.map((card, index) => (
          <article
            key={card.label}
            className="rounded-[24px] border border-[#ebedf7] bg-white px-8 py-7 shadow-[0_20px_55px_rgba(19,27,46,0.04)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1d2438]">
              {card.label}
            </p>
            <div className="mt-5 flex items-end gap-3">
              <h3 className="font-auth-headline text-[3.25rem] font-bold leading-none text-[#172035]">
                {card.formatValue(summaryValues[index])}
              </h3>
              <span
                className={`pb-1 text-xl font-semibold ${card.accentClassName}`}
              >
                {card.accent}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section
        id="recent-messages"
        className="mt-12 overflow-hidden rounded-[28px] border border-[#e8ebf8] bg-white shadow-[0_24px_70px_rgba(19,27,46,0.04)]"
      >
        <div className="flex flex-col gap-4 border-b border-[#edf0fb] px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-auth-headline text-[2rem] font-semibold text-[#131b2e]">
            Recent Contact Messages
          </h2>
          <Link
            href={APP_ROUTES.adminMessages}
            className="text-sm font-bold uppercase tracking-[0.28em] text-[#004ac6] transition hover:text-[#003da4]"
          >
            View All Inbox
          </Link>
        </div>

        {recentContacts.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="font-auth-headline text-2xl font-semibold text-[#131b2e]">
              No messages yet
            </p>
            <p className="mt-3 text-base text-[#65708a]">
              New contact submissions will appear here once prospects start
              reaching out.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#f1f4ff]">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-[0.28em] text-[#1d2438]">
                    Sender
                  </th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-[0.28em] text-[#1d2438]">
                    Email
                  </th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-[0.28em] text-[#1d2438]">
                    Subject
                  </th>
                  <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-[0.28em] text-[#1d2438]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1fb]">
                {recentContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="transition hover:bg-[#fafbff]"
                  >
                    <td className="px-8 py-6 text-[1.05rem] font-semibold text-[#111827]">
                      {contact.name}
                    </td>
                    <td className="px-8 py-6 text-[1.05rem] text-[#5f7597]">
                      {contact.email}
                    </td>
                    <td className="px-8 py-6 text-[1.05rem] text-[#1f2937]">
                      {buildSubject(contact)}
                    </td>
                    <td className="px-8 py-6 text-right text-sm text-[#8a97b2]">
                      {formatDate(contact.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
