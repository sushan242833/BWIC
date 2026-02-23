import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { baseUrl } from "@/pages/api/rest_api";
import { isAdminAuthenticated, setAdminToken } from "@/utils/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const nextPath = useMemo(() => {
    const next = router.query.next;
    return typeof next === "string" && next.startsWith("/admin")
      ? next
      : "/admin";
  }, [router.query.next]);

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, password }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.message || "Login failed");
      }

      if (!payload?.token) {
        throw new Error("Token missing from response");
      }

      setAdminToken(payload.token);
      router.replace(nextPath);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
          Admin Login
        </h1>
        <p className="text-slate-600 text-center mb-6">
          Enter your admin ID and password to continue.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-id" className="block text-sm font-medium mb-1">
              Admin ID
            </label>
            <input
              id="admin-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
