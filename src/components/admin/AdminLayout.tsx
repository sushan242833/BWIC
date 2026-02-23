import Link from "next/link";
import React, { JSX, useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faGauge,
  faArrowRightFromBracket,
  faLayerGroup,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { clearAdminToken } from "@/utils/adminAuth";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    clearAdminToken();
    router.push("/admin/login");
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

          <div className="relative flex items-center gap-3 pr-8">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="text-2xl "
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 min-h-screen">{children}</section>
      </main>
    </div>
  );
}
