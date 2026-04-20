import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Heart, SearchX } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { assetUrl } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import { getFavorites } from "@/modules/favorites/api";
import FavoriteButton from "@/modules/favorites/components/FavoriteButton";
import type { FavoriteItem } from "@/modules/favorites/types";
import type { PropertySummary } from "@/modules/properties/types";

const parseNumericValue = (value?: string | number | null): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/[^0-9.]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value?: string | number | null): string => {
  const parsed = parseNumericValue(value);
  if (parsed === null) {
    return value ? `NPR ${value}` : "NPR N/A";
  }

  return `NPR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(parsed)}`;
};

const formatPercent = (value?: string | number | null): string => {
  const parsed = parseNumericValue(value);
  if (parsed === null) {
    return "N/A";
  }

  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 1,
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 1,
  }).format(parsed)}%`;
};

const getAreaLabel = (property: PropertySummary): string => {
  if (property.areaNepali?.trim()) {
    return property.areaNepali;
  }

  const parsed = parseNumericValue(property.area);
  if (parsed === null) {
    return "Area unavailable";
  }

  return `${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 1,
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 1,
  }).format(parsed)} sq.ft`;
};

const LoadingState = () => (
  <section className="min-h-[60vh] bg-[#fafbff] px-4 py-20">
    <div className="mx-auto max-w-6xl text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dbe1ff] border-t-blue-600" />
      <p className="mt-5 text-lg font-semibold text-slate-800">
        Loading your favorite properties...
      </p>
    </div>
  </section>
);

const AuthRequiredState = () => (
  <section className="min-h-[60vh] bg-[#fafbff] px-4 py-20">
    <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <Heart className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-slate-950">
        Sign in to view favorites
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Create an account or log in to save properties and return to them
        anytime.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Link
          href={APP_ROUTES.register}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Go to Sign Up
        </Link>
        <Link
          href={APP_ROUTES.login}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-600 hover:text-blue-700"
        >
          Log In
        </Link>
      </div>
    </div>
  </section>
);

const EmptyState = ({ onBrowse }: { onBrowse: () => void }) => (
  <div className="rounded-lg border-2 border-dashed border-[#d8def6] bg-white px-6 py-16 text-center shadow-[0_12px_28px_rgba(19,27,46,0.03)]">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-[#eef1ff] text-[#9aa2c8]">
      <SearchX className="h-8 w-8" />
    </div>
    <h2 className="mt-6 text-3xl font-bold text-[#131b2e]">
      You have not added any favorites yet.
    </h2>
    <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#5b6174]">
      Save properties that catch your eye, then compare them here whenever you
      are ready.
    </p>
    <button
      type="button"
      onClick={onBrowse}
      className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-blue-700"
    >
      Browse Properties
    </button>
  </div>
);

const FavoritesPage = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getFavorites();

        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          console.error("Failed to fetch favorites:", fetchError);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load favorites.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchFavorites();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, user]);

  if (isAuthLoading || isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <AuthRequiredState />;
  }

  return (
    <section className="min-h-screen bg-[#fafbff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Saved properties
            </p>
            <h1 className="mt-2 text-4xl font-bold text-[#131b2e]">
              Your Favorites
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#5b6174]">
              Keep promising investments close while you compare ROI, area, and
              location.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void router.push(APP_ROUTES.properties)}
            className="rounded-lg border border-[#c8d4ff] bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-blue-700 transition hover:border-blue-700"
          >
            Browse More
          </button>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        {!error && items.length === 0 && (
          <EmptyState onBrowse={() => void router.push(APP_ROUTES.properties)} />
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const property = item.property;
              const primaryImage =
                property.primaryImage ?? property.images?.[0];

              return (
                <article
                  key={item.id}
                  onClick={() =>
                    void router.push(APP_ROUTES.propertyDetail(property.id))
                  }
                  className="group cursor-pointer overflow-hidden rounded-lg border border-[#e7e8f1] bg-white shadow-[0_10px_28px_rgba(19,27,46,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(19,27,46,0.08)]"
                >
                  <div className="relative h-[214px] overflow-hidden bg-[#dfe5ff]">
                    {primaryImage ? (
                      <img
                        src={assetUrl(primaryImage)}
                        alt={property.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#eef1ff]">
                        <span className="text-2xl font-bold text-blue-700">
                          {property.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)]">
                      {property.category?.name ?? "Investment"}
                    </div>
                    <div className="absolute right-4 top-4">
                      <FavoriteButton
                        propertyId={property.id}
                        initialIsFavorited
                        onChange={(isFavorited) => {
                          if (!isFavorited) {
                            setItems((current) =>
                              current.filter(
                                (favorite) =>
                                  favorite.property.id !== property.id,
                              ),
                            );
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700">
                      {property.location}
                    </p>
                    <h2 className="mt-2 text-[20px] font-bold leading-tight text-[#131b2e] transition-colors group-hover:text-blue-700">
                      {property.title}
                    </h2>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#edf0fb] py-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#72778a]">
                          ROI
                        </p>
                        <p className="mt-2 text-[18px] font-semibold text-[#131b2e]">
                          {formatPercent(property.roi)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#72778a]">
                          Area
                        </p>
                        <p className="mt-2 text-[18px] font-semibold text-[#131b2e]">
                          {getAreaLabel(property)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#72778a]">
                          Investment Ask
                        </p>
                        <p className="mt-2 text-[20px] font-semibold text-blue-700">
                          {formatCurrency(property.price)}
                        </p>
                      </div>

                      <span className="border-b border-[#c8d4ff] pb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-blue-700 transition group-hover:border-blue-700">
                        View Details
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FavoritesPage;
