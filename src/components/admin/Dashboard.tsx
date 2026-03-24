import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { getApiData } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/routes";

interface StatsResponse {
  totalProperties: number;
  totalCategories: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getApiData<StatsResponse>(
          API_ENDPOINTS.stats.summary,
        );
        setStats(data);
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      href: APP_ROUTES.adminAddProperty,
      label: "Add New Property",
      icon: "➕",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      href: APP_ROUTES.adminProperties,
      label: "Manage Properties",
      icon: "🏘️",
      gradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700",
    },
    {
      href: APP_ROUTES.adminCategories,
      label: "Manage Categories",
      icon: "🏷️",
      gradient: "from-amber-500 to-amber-600",
      hoverGradient: "from-amber-600 to-amber-700",
    },
  ];

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
            👋 Welcome Back, Admin
          </h1>
          <p className="text-lg text-slate-600">
            Manage your properties, categories, and settings with ease.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {/* Properties Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                  🏠
                </div>
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Total
                </div>
              </div>
              <h2 className="text-5xl font-bold text-slate-800 mb-2">
                {stats.totalProperties}
              </h2>
              <p className="text-slate-500 font-medium">Properties Listed</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  href={APP_ROUTES.adminProperties}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  View all{" "}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Categories Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
                  📂
                </div>
                <div className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Active
                </div>
              </div>
              <h2 className="text-5xl font-bold text-slate-800 mb-2">
                {stats.totalCategories}
              </h2>
              <p className="text-slate-500 font-medium">Categories Available</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  href={APP_ROUTES.adminCategories}
                  className="text-sm text-amber-600 font-semibold hover:text-amber-700 transition-colors inline-flex items-center gap-1"
                >
                  View all{" "}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} group-hover:${action.hoverGradient} transition-all`}
                ></div>
                <div className="relative p-6 flex items-center gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {action.label}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      Click to proceed
                    </p>
                  </div>
                  <div className="ml-auto text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Recent Activity
            </h2>
            <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View All
            </button>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">📈</div>
            <p className="text-slate-500 font-medium mb-2">
              No recent activity yet
            </p>
            <p className="text-slate-400 text-sm">
              Recent property additions and updates will appear here
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
