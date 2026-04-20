import React, { useEffect, useRef, useState } from "react";
import { navItems as defaultNavItems, NavbarItem } from "@/utils/navItems";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faGauge,
  faGear,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { APP_ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { defaultBrand } from "@/utils/brand";

interface NavbarProps {
  brand?: {
    name: string;
    logo?: string;
  };
  navItems?: NavbarItem[];
}

const Navbar: React.FC<NavbarProps> = ({
  brand = defaultBrand,
  navItems = defaultNavItems,
}) => {
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const pathname = router.pathname;
  const isActivePath = (path: string) =>
    path === "/"
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    await router.push(APP_ROUTES.home);
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <nav className="bg-white text-black shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <Link href={APP_ROUTES.home}>
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="h-11 w-auto object-contain"
                />
              ) : (
                <span className="text-lg font-semibold">{brand.name}</span>
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`hover:text-blue-600 ${
                    isActivePath(item.path) ? "text-blue-700 font-semibold" : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            {!isLoading && !user && (
              <Link
                href={APP_ROUTES.login}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                login
              </Link>
            )}

            {!isLoading && user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>{user.fullName}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
                    <Link
                      href={APP_ROUTES.favorites}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <FontAwesomeIcon icon={faHeart} className="text-sm" />
                      <span>Favorites</span>
                    </Link>

                    <Link
                      href={APP_ROUTES.settings}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <FontAwesomeIcon icon={faGear} className="text-sm" />
                      <span>Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href={APP_ROUTES.adminDashboard}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                        title="Open dashboard"
                      >
                        <FontAwesomeIcon icon={faGauge} className="text-sm" />
                        <span>Dashboard</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <FontAwesomeIcon
                        icon={faArrowRightFromBracket}
                        className="text-sm"
                      />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <ul className="space-y-2 pb-4 pt-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`block py-2 px-3 rounded-md ${
                      isActivePath(item.path)
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}

              {!isLoading && !user && (
                <>
                  <li>
                    <Link
                      href={APP_ROUTES.login}
                      className="block rounded-md py-2 px-3 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={APP_ROUTES.register}
                      className="block rounded-md bg-blue-600 py-2 px-3 font-medium text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}

              {!isLoading && user && (
                <>
                  <li className="px-3 pt-2 text-sm font-medium text-slate-500">
                    Signed in as {user.fullName}
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        href={APP_ROUTES.adminDashboard}
                        className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FontAwesomeIcon icon={faGauge} className="text-sm" />
                        <span>Dashboard</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href={APP_ROUTES.favorites}
                      className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faHeart} className="text-sm" />
                      <span>Favorites</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={APP_ROUTES.settings}
                      className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faGear} className="text-sm" />
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-left font-medium text-white"
                    >
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
