import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { APP_ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowUpRight,
  Bell,
  Building2,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Search,
  Shapes,
  X,
  type LucideIcon,
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  matchPrefixes: string[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  navItems?: SidebarItem[];
}

const defaultNavItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: APP_ROUTES.adminDashboard,
    icon: LayoutDashboard,
    matchPrefixes: [APP_ROUTES.adminDashboard],
  },
  {
    name: "Properties",
    path: APP_ROUTES.adminProperties,
    icon: Building2,
    matchPrefixes: [
      APP_ROUTES.adminProperties,
      "/admin/addProperty",
      "/admin/editProperty",
    ],
  },
  {
    name: "Categories",
    path: APP_ROUTES.adminCategories,
    icon: Shapes,
    matchPrefixes: [
      APP_ROUTES.adminCategories,
      "/admin/createCategory",
      "/admin/editCategory",
    ],
  },
  {
    name: "Messages",
    path: APP_ROUTES.adminMessages,
    icon: Mail,
    matchPrefixes: [APP_ROUTES.adminMessages],
  },
];

const getPageTitle = (pathname: string, fallbackTitle?: string): string => {
  if (pathname === APP_ROUTES.adminDashboard) return "Dashboard";
  if (pathname === APP_ROUTES.adminProperties) return "Properties";
  if (pathname === APP_ROUTES.adminMessages) return "Messages";
  if (pathname.startsWith("/admin/messages/")) return "Inquiry Details";
  if (pathname.startsWith("/admin/addProperty")) return "Add Property";
  if (pathname.startsWith("/admin/editProperty")) return "Edit Property";
  if (pathname === APP_ROUTES.adminCategories) return "Categories";
  if (pathname.startsWith("/admin/createCategory")) return "Create Category";
  if (pathname.startsWith("/admin/editCategory")) return "Edit Category";
  if (pathname.startsWith("/admin/categories/")) return "Category Details";

  return fallbackTitle ?? "Admin";
};

const formatRole = (role: string | undefined): string => {
  if (!role) return "Admin";
  if (role === "ADMIN") return "Super Admin";
  return role
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const getInitials = (name: string | undefined): string => {
  if (!name?.trim()) return "A";

  const parts = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase());

  return parts.join("") || "A";
};

export default function AdminLayout({
  children,
  title,
  navItems = defaultNavItems,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [router.asPath]);

  const pageTitle = getPageTitle(router.pathname, title);

  const handleLogout = async () => {
    await logout();
    await router.push(APP_ROUTES.adminLogin);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ff] font-auth-body text-[#131b2e]">
      <div
        className={`fixed inset-0 z-40 bg-[#020617]/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-white/6 bg-[#04081b] text-white shadow-[0_24px_90px_rgba(2,6,23,0.45)] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/6 px-7 pb-10 pt-9">
          <div className="flex items-start justify-between gap-4 lg:block">
            <div>
              <Link
                href={APP_ROUTES.adminDashboard}
                className="font-auth-headline text-[1.5rem] font-extrabold tracking-[-0.04em] text-white"
              >
                Blue Whale Investment
              </Link>
              <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[#7d869f]">
                Admin Panel
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-white/10 p-2 text-[#94a3b8] transition hover:border-white/20 hover:text-white lg:hidden"
              aria-label="Close admin navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-10">
          {navItems.map((item) => {
            const isActive =
              item.path === APP_ROUTES.adminDashboard
                ? router.pathname === item.path
                : item.matchPrefixes.some((prefix) =>
                    router.pathname.startsWith(prefix),
                  );
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-4 rounded-2xl px-5 py-4 text-lg font-medium transition ${
                  isActive
                    ? "bg-[#0d163b] text-[#d6ebff] shadow-[inset_0_0_0_1px_rgba(100,116,139,0.12)]"
                    : "text-[#a4afc0] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-[#11255a] text-[#9ed0ff]"
                      : "bg-transparent text-[#7d8ba3] group-hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/6 px-7 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#c1fff4] via-[#96d8d1] to-[#4c718a] font-auth-headline text-lg font-bold text-[#082038] shadow-[0_12px_30px_rgba(86,168,187,0.25)]">
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white">
                {user?.fullName ?? "Admin User"}
              </p>
              <p className="mt-1 text-sm text-[#8c97b0]">
                {formatRole(user?.role)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-10 flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left text-lg font-medium text-[#94a3b8] transition hover:bg-white/[0.04] hover:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-[#7d8ba3]">
              <LogOut className="h-5 w-5" />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-[19rem]">
        <header className="sticky top-0 z-30 border-b border-[#e8ebf8] bg-white/88 backdrop-blur-2xl">
          <div className="flex min-h-[6.25rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dbe2fb] bg-white text-[#4d5f86] transition hover:border-[#c7d2f6] hover:text-[#0f172a] lg:hidden"
                aria-label="Open admin navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <nav className="flex items-center gap-2 text-sm text-[#8b92a5] sm:text-[1.05rem]">
                <span>Admin</span>
                <ChevronRight className="h-4 w-4 text-[#c4cadc]" />
                <span className="font-semibold text-[#004ac6]">{pageTitle}</span>
              </nav>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <label className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7d889f]" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="h-12 w-[18rem] rounded-2xl border border-transparent bg-[#dfe5ff] pl-12 pr-4 text-base text-[#334155] outline-none transition placeholder:text-[#6f7f9a] focus:border-[#b7c6ff] focus:bg-white"
                />
              </label>

              <Link
                href={APP_ROUTES.home}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#dbe2fb] bg-white px-4 text-sm font-semibold text-[#25314d] transition hover:border-[#bfd0ff] hover:text-[#004ac6]"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </Link>

              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#2f3347] transition hover:bg-[#eef2ff]"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-[0.7rem] top-[0.55rem] h-2.5 w-2.5 rounded-full bg-[#d62c29] ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-6.25rem)] bg-[#f7f5ff]">
          {children}
        </main>
      </div>
    </div>
  );
}
