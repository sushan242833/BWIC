import Link from "next/link";
import React, { JSX, useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/hooks/useAuth";
import {
  faBars,
  faXmark,
  faGauge,
  faArrowRightFromBracket,
  faLayerGroup,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarItem {
  name: string;
  path: string;
  icon: JSX.Element;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  navItems?: SidebarItem[];
}

export default function AdminLayout({
  children,
  title,
  navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FontAwesomeIcon icon={faGauge} />,
    },
    {
      name: "Properties",
      path: "/admin/properties",
      icon: <FontAwesomeIcon icon={faHouse} />,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <FontAwesomeIcon icon={faLayerGroup} />,
    },
  ],
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    await router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "md:w-64 w-16"
        } bg-slate-700 text-white shadow-md p-4 flex flex-col relative transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-6">
          {!sidebarCollapsed && (
            <Link
              href="/"
              className="hidden md:block text-2xl font-extrabold bg-gradient-to-r from-yellow-300 to-white text-transparent bg-clip-text"
            >
              BWIC
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden md:block ${sidebarCollapsed ? "mx-auto" : ""}`}
          >
            <FontAwesomeIcon
              icon={sidebarCollapsed ? faBars : faXmark}
              className="text-xl cursor-pointer mt-1"
            />
          </button>
        </div>

        <nav className="flex flex-col space-y-6 mt-4 w-full items-center">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 hover:text-yellow-300 py-3 ${
                  sidebarCollapsed
                    ? "justify-center"
                    : "justify-start w-full px-2"
                } ${
                  isActive ? "text-yellow-300 font-bold cursor-default" : ""
                }`}
                onClick={(e) => {
                  if (isActive) e.preventDefault();
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span
                    className={`
                      hidden md:inline relative 
                      ${
                        !isActive
                          ? "after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[3px] after:bg-yellow-300 hover:after:w-full after:transition-all after:duration-400"
                          : ""
                      }
                    `}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="w-full bg-white shadow px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{title}</span>
          </div>

          <div className="flex items-center gap-4 pr-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">
                  {user.fullName}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {user.role}
                </p>
              </div>
            )}
            <button
              onClick={() => router.push("/")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              View Site
            </button>
            <button
              onClick={() => void handleLogout()}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white focus:outline-none cursor-pointer transition hover:bg-slate-700"
            >
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="text-base"
              />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 min-h-screen">{children}</section>
      </main>
    </div>
  );
}
