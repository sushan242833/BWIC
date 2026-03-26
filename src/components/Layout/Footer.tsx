import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faGlobe,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { APP_ROUTES } from "@/config/routes";
import { navItems } from "@/utils/navItems";

const FooterSection: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 sm:px-8 md:grid-cols-3 md:gap-16">
        <div className="max-w-xs">
          <h2 className="mb-6 font-auth-headline text-xl font-bold text-slate-900">
            Blue Whale Investment
          </h2>
          <p className="font-auth-body text-sm leading-relaxed text-slate-500">
            Premium real estate investment platform specializing in verified
            high-yield opportunities across Nepal.
          </p>
        </div>

        <div>
          <h5 className="mb-6 font-auth-headline text-xl font-bold text-slate-900">
            Quick Links
          </h5>
          <ul className="space-y-4 font-auth-body text-sm text-slate-500">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="underline decoration-2 underline-offset-4 transition-all hover:text-blue-500"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-6 font-auth-headline text-xl font-bold text-slate-900">
            Office
          </h5>
          <p className="mb-4 font-auth-body text-sm leading-relaxed text-slate-500">
            Nagarjun Tole, Bafal-13
            <br />
            Nepal
          </p>
          <div className="flex gap-6 text-slate-400">
            <a
              href={APP_ROUTES.home}
              aria-label="Website"
              className="transition hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faGlobe} className="text-xl" />
            </a>
            <a
              href="mailto:bwic@gmail.com"
              aria-label="Email"
              className="transition hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-xl" />
            </a>
            <a
              href="tel:+9779851069535"
              aria-label="Call"
              className="transition hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl border-t border-slate-200 px-6 py-8 sm:px-8">
        <p className="text-center font-auth-body text-sm text-slate-500">
          &copy; 2026 Blue Whale Investment.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
