import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";
import { APP_ROUTES } from "@/config/routes";

interface RecoveryShellProps {
  pageTitle: string;
  children: ReactNode;
  variant?: "default" | "minimalLegal";
}

const footerLinks = [
  { href: APP_ROUTES.about, label: "About" },
  { href: APP_ROUTES.properties, label: "Properties" },
  { href: APP_ROUTES.contact, label: "Contact" },
];

export default function RecoveryShell({
  pageTitle,
  children,
}: RecoveryShellProps) {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <main className="auth-recovery-shell font-auth-body relative min-h-screen overflow-hidden text-[#131b2e]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-16%] left-[-8%] h-[420px] w-[420px] rounded-full bg-[#dbe1ff] opacity-70 blur-[120px]" />
          <div className="absolute right-[-12%] bottom-[18%] h-[360px] w-[360px] rounded-full bg-[#e2dfff] opacity-60 blur-[120px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col px-6 py-8 sm:px-8 lg:px-12">
          <header className="mx-auto mb-10 flex w-full max-w-screen-xl justify-center sm:justify-start">
            <BrandLogo
              href={APP_ROUTES.home}
              className="items-center sm:items-start"
              imageClassName="h-20 w-auto object-contain sm:h-24"
            />
          </header>

          <div className="mx-auto flex w-full max-w-screen-xl flex-1 items-center justify-center">
            {children}
          </div>

          <footer className="mt-16 border-t border-[#dfe2f1] pt-8 sm:mt-20 sm:pt-10">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <p className="text-sm text-[#737686]">
                  © 2026 Blue Whale Investment.
                </p>
              </div>

              <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-[#5a6075] md:justify-end">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="underline-offset-4 transition hover:text-[#131b2e] hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
