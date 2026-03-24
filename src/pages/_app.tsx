import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  APP_ROUTES,
  FULLSCREEN_ROUTES,
  isProtectedAdminRoute,
  SESSION_AWARE_AUTH_ROUTES,
} from "@/config/routes";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLE } from "@/modules/auth/types";
import { useRouter } from "next/router";
import { useEffect } from "react";

function FullscreenState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8ff] px-6 text-center text-[#434655]">
      <div>
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#004ac6] border-t-transparent" />
        <p className="font-auth-headline text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
}

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isFullscreenRoute = FULLSCREEN_ROUTES.has(router.pathname);
  const isSessionAwareAuthRoute = SESSION_AWARE_AUTH_ROUTES.has(router.pathname);
  const isAdminProtectedPage = isProtectedAdminRoute(router.pathname);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAdminProtectedPage) {
      if (!user) {
        const redirect = encodeURIComponent(router.asPath);
        void router.replace(`${APP_ROUTES.adminLogin}?redirect=${redirect}`);
        return;
      }

      if (user.role !== USER_ROLE.ADMIN) {
        void router.replace(APP_ROUTES.home);
      }

      return;
    }

    if (isSessionAwareAuthRoute && user) {
      void router.replace(
        user.role === USER_ROLE.ADMIN
          ? APP_ROUTES.adminDashboard
          : APP_ROUTES.home,
      );
    }
  }, [isAdminProtectedPage, isLoading, isSessionAwareAuthRoute, router, user]);

  if (isAdminProtectedPage) {
    if (isLoading) {
      return <FullscreenState message="Checking admin access..." />;
    }

    if (!user) {
      return <FullscreenState message="Redirecting to admin login..." />;
    }

    if (user.role !== USER_ROLE.ADMIN) {
      return <FullscreenState message="Redirecting to the public site..." />;
    }

    return (
      <AdminLayout title="Admin Panel">
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  if (isSessionAwareAuthRoute) {
    if (isLoading) {
      return <FullscreenState message="Checking your session..." />;
    }

    if (user) {
      return <FullscreenState message="Redirecting to your dashboard..." />;
    }

    return <Component {...pageProps} />;
  }

  if (isFullscreenRoute) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} />
    </AuthProvider>
  );
}
