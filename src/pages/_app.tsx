import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isAdminAuthenticated } from "@/utils/adminAuth";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isAdminRoute = router.pathname.startsWith("/admin");
  const isAdminLoginRoute = router.pathname === "/admin/login";
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    if (!isAdminRoute || isAdminLoginRoute) {
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(true);
    if (!isAdminAuthenticated()) {
      router.replace(`/admin/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsCheckingAuth(false);
  }, [isAdminLoginRoute, isAdminRoute, router]);

  const ActiveLayout =
    isAdminRoute && !isAdminLoginRoute ? AdminLayout : Layout;

  if (isAdminRoute && !isAdminLoginRoute && isCheckingAuth) {
    return null;
  }

  return (
    <ActiveLayout title={"Admin Panel"}>
      <Component {...pageProps} />
    </ActiveLayout>
  );
}
