import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect } from "react";

const authRoutes = new Set(["/login", "/register", "/admin/login"]);

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

  const isAuthRoute = authRoutes.has(router.pathname);
  const isProtectedAdminRoute =
    router.pathname.startsWith("/admin") && router.pathname !== "/admin/login";

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isProtectedAdminRoute) {
      if (!user) {
        const redirect = encodeURIComponent(router.asPath);
        void router.replace(`/admin/login?redirect=${redirect}`);
        return;
      }

      if (user.role !== "ADMIN") {
        void router.replace("/");
      }

      return;
    }

    if (isAuthRoute && user) {
      void router.replace(user.role === "ADMIN" ? "/admin" : "/");
    }
  }, [isAuthRoute, isLoading, isProtectedAdminRoute, router, user]);

  if (isProtectedAdminRoute) {
    if (isLoading) {
      return <FullscreenState message="Checking admin access..." />;
    }

    if (!user) {
      return <FullscreenState message="Redirecting to admin login..." />;
    }

    if (user.role !== "ADMIN") {
      return <FullscreenState message="Redirecting to the public site..." />;
    }

    return (
      <AdminLayout title="Admin Panel">
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  if (isAuthRoute) {
    if (isLoading) {
      return <FullscreenState message="Checking your session..." />;
    }

    if (user) {
      return <FullscreenState message="Redirecting to your dashboard..." />;
    }

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
