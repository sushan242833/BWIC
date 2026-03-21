import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { capitalize } from "@/utils/Capitalize";
import { contactInfo } from "@/utils/ContactInformation";
import { apiFetch, assetUrl } from "@/lib/api/client";
import {
  buildRecommendationPreferencesPayload,
  getRecommendations,
} from "@/modules/recommendations/api";
import type {
  RecommendationItem,
  RecommendationLocationSuggestion,
  RecommendationPagination,
  RecommendationPlaceDetails,
  RecommendationPreferences,
} from "@/modules/recommendations/types";
import { defaultRecommendationPreferences } from "@/modules/recommendations/types";

const DEFAULT_RECOMMENDATION_PAGE_SIZE = 5;
const EMPTY_TOTAL_PAGES = 1;
const LOCATION_AUTOCOMPLETE_MIN_CHARS = 2;
const LOCATION_AUTOCOMPLETE_DEBOUNCE_MS = 300;

const defaultPagination: RecommendationPagination = {
  page: 1,
  limit: DEFAULT_RECOMMENDATION_PAGE_SIZE,
  total: 0,
  totalPages: EMPTY_TOTAL_PAGES,
  hasNext: false,
  hasPrev: false,
};

const scoreLabels: Record<string, string> = {
  location: "Location",
  price: "Price",
  roi: "ROI",
  area: "Area",
  distance: "Access",
};

const scoreWeights: Record<string, number> = {
  location: 35,
  price: 35,
  area: 20,
  distance: 5,
  roi: 5,
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const statCardClassName =
  "rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]";

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "Open";

  return `NPR ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;
};

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
};

const Recommendations = () => {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const [preferences, setPreferences] = useState<RecommendationPreferences>(
    defaultRecommendationPreferences,
  );
  const [appliedPreferences, setAppliedPreferences] =
    useState<RecommendationPreferences>(defaultRecommendationPreferences);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    [],
  );
  const [pagination, setPagination] =
    useState<RecommendationPagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    RecommendationLocationSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [selectedPlaceDetails, setSelectedPlaceDetails] =
    useState<RecommendationPlaceDetails | null>(null);
  const [appliedPlaceDetails, setAppliedPlaceDetails] =
    useState<RecommendationPlaceDetails | null>(null);

  const hasAppliedPreferences = useMemo(
    () =>
      Object.values(buildRecommendationPreferencesPayload(appliedPreferences)).some(
        (value) => value !== undefined,
      ),
    [appliedPreferences],
  );

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!hasAppliedPreferences) {
        setRecommendations([]);
        setError("");
        setPagination((prev) => ({
          ...prev,
          page: 1,
          total: 0,
          totalPages: EMPTY_TOTAL_PAGES,
          hasNext: false,
          hasPrev: false,
        }));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getRecommendations({
          preferences: {
            ...buildRecommendationPreferencesPayload(appliedPreferences),
            ...(appliedPlaceDetails?.location
              ? {
                  latitude: appliedPlaceDetails.location.lat,
                  longitude: appliedPlaceDetails.location.lng,
                }
              : {}),
          },
          page: pagination.page,
          limit: pagination.limit,
        });

        setRecommendations(Array.isArray(response.data) ? response.data : []);
        setPagination((prev) =>
          response.pagination
            ? response.pagination
            : {
                ...prev,
                total: 0,
                totalPages: EMPTY_TOTAL_PAGES,
                hasNext: false,
                hasPrev: false,
              },
        );
      } catch (fetchError) {
        console.error("Failed to fetch recommendations:", fetchError);
        setRecommendations([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load recommendations.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [
    appliedPreferences,
    appliedPlaceDetails,
    hasAppliedPreferences,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    if (preferences.location.trim().length < LOCATION_AUTOCOMPLETE_MIN_CHARS) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const response = await apiFetch(
          `/api/locations/autocomplete?q=${encodeURIComponent(
            preferences.location.trim(),
          )}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location suggestions");
        }

        const payload = await response.json();
        setLocationSuggestions(Array.isArray(payload?.data) ? payload.data : []);
      } catch (fetchError) {
        console.error("Failed to fetch recommendation location suggestions:", fetchError);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, LOCATION_AUTOCOMPLETE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [preferences.location]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (locationRef.current && !locationRef.current.contains(target)) {
        setIsLocationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handlePreferenceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));

    if (name === "location") {
      setSelectedPlaceId("");
      setSelectedPlaceDetails(null);
      setIsLocationDropdownOpen(true);
    }
  };

  const handleLocationSelect = async (
    suggestion: RecommendationLocationSuggestion,
  ) => {
    setPreferences((prev) => ({ ...prev, location: suggestion.description }));
    setSelectedPlaceId(suggestion.placeId);
    setLocationSuggestions([]);
    setIsLocationDropdownOpen(false);

    try {
      const response = await apiFetch(
        `/api/locations/place-details?placeId=${encodeURIComponent(
          suggestion.placeId,
        )}`,
      );

      if (!response.ok) {
        setSelectedPlaceDetails(null);
        return;
      }

      const payload = await response.json();
      setSelectedPlaceDetails(payload?.data ?? null);
    } catch (fetchError) {
      console.error("Failed to fetch location details:", fetchError);
      setSelectedPlaceDetails(null);
    }
  };

  const applyBrief = () => {
    if (requiresLocationSelection) {
      return;
    }

    setAppliedPreferences(preferences);
    setAppliedPlaceDetails(selectedPlaceDetails);
    setPagination((prev) => ({ ...prev, page: 1 }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearBrief = () => {
    setPreferences(defaultRecommendationPreferences);
    setAppliedPreferences(defaultRecommendationPreferences);
    setSelectedPlaceId("");
    setSelectedPlaceDetails(null);
    setAppliedPlaceDetails(null);
    setLocationSuggestions([]);
    setPagination((prev) => ({ ...defaultPagination, limit: prev.limit }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activePreferenceCount = useMemo(
    () =>
      Object.values(buildRecommendationPreferencesPayload(appliedPreferences)).filter(
        (value) => value !== undefined,
      ).length,
    [appliedPreferences],
  );

  const requiresLocationSelection =
    preferences.location.trim().length > 0 && !selectedPlaceId;

  const topMatch = recommendations[0];
  const preferredPrice =
    buildRecommendationPreferencesPayload(appliedPreferences).price;

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] text-slate-900">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#091325_0%,#112449_48%,#1d5eff_100%)] text-white">
        <div className="absolute inset-0">
          <div className="absolute left-[-6rem] top-10 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute right-[-4rem] top-0 h-96 w-96 rounded-full bg-sky-200/15 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-blue-200/15 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-50">
                Smart Recommendations
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Find investment properties aligned with your goals.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Set your preferences once and explore highly relevant property
                matches with clear ranking signals, transparent scoring, and an
                experience designed to help you decide faster.
              </p>
            </div>

            <div
              className={`grid gap-4 ${
                recommendations.length > 0 ? "sm:grid-cols-2" : "sm:grid-cols-1"
              }`}
            >
              {recommendations.length > 0 && (
                <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5 backdrop-blur">
                  <p className="text-sm text-slate-300">Best current match</p>
                  <p className="mt-2 text-4xl font-black text-white">
                    {topMatch ? `${topMatch.matchPercentage}%` : "--"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {topMatch?.property.title}
                  </p>
                </div>
              )}
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur sm:max-w-[280px] sm:justify-self-end">
                <p className="text-sm text-slate-200">Recommendation mode</p>
                <p className="mt-2 text-3xl font-black text-white">
                  Curated ranking
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Results are prioritized by relevance and shown with transparent
                  scoring reasons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-12 max-w-7xl mx-auto px-4 pb-14 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                  Recommendation Brief
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  Define your ideal investment profile
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                  Focus the ranking with your preferred location, price, ROI,
                  property size, and road access. This brief now sits above the
                  shortlist so the page feels lighter and easier to scan.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
                <div className={statCardClassName}>
                  <p className="text-sm text-slate-500">Showing</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {pagination.total}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">Top ranked results</p>
                </div>
                <div className={statCardClassName}>
                  <p className="text-sm text-slate-500">Signals</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {activePreferenceCount}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">Inputs applied</p>
                </div>
                <div className={statCardClassName}>
                  <p className="text-sm text-slate-500">Preferred price</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatCurrency(preferredPrice)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">Ranking target</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
              <div className="relative" ref={locationRef}>
                <input
                  name="location"
                  value={preferences.location}
                  onChange={handlePreferenceChange}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                  placeholder="Select preferred location"
                  className={inputClassName}
                />

                {isLocationDropdownOpen &&
                  preferences.location.trim().length >=
                    LOCATION_AUTOCOMPLETE_MIN_CHARS && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {locationLoading && (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        Loading locations...
                      </div>
                    )}

                    {!locationLoading && locationSuggestions.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No locations found
                      </div>
                    )}

                    {!locationLoading &&
                      locationSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.placeId}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
                          className={`block w-full border-b border-slate-100 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-slate-50 ${
                            selectedPlaceId === suggestion.placeId
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700"
                          }`}
                        >
                          {suggestion.description}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <input
                type="number"
                name="locationRadiusKm"
                value={preferences.locationRadiusKm}
                onChange={handlePreferenceChange}
                placeholder="Radius km"
                className={inputClassName}
              />
              <input
                type="number"
                name="price"
                value={preferences.price}
                onChange={handlePreferenceChange}
                placeholder="Ideal price"
                className={inputClassName}
              />
              <input
                type="number"
                step="0.01"
                name="roi"
                value={preferences.roi}
                onChange={handlePreferenceChange}
                placeholder="Target ROI %"
                className={inputClassName}
              />
              <input
                type="number"
                name="area"
                value={preferences.area}
                onChange={handlePreferenceChange}
                placeholder="Ideal area sqft"
                className={inputClassName}
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <input
                type="number"
                name="maxDistanceFromHighway"
                value={preferences.maxDistanceFromHighway}
                onChange={handlePreferenceChange}
                placeholder="Preferred max distance from highway"
                className={inputClassName}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={applyBrief}
                  disabled={requiresLocationSelection}
                  className="rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generate recommendations
                </button>
                <button
                  onClick={clearBrief}
                  className="rounded-2xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset brief
                </button>
              </div>
            </div>

            {selectedPlaceDetails && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
                Selected location:
                <span className="ml-1 font-semibold text-slate-900">
                  {selectedPlaceDetails.primaryText}
                </span>
              </div>
            )}

          </section>

          <div ref={resultsRef} className="space-y-6">
            {loading && (
              <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="mt-5 text-base font-medium text-slate-700">
                  Ranking the top 20 properties against your profile...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[32px] border border-red-200 bg-red-50 px-8 py-16 text-center">
                <p className="text-lg font-semibold text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && !hasAppliedPreferences && (
              <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                <h3 className="text-2xl font-black text-slate-900">
                  Add your recommendation inputs to begin
                </h3>
                <p className="mt-4 max-w-2xl mx-auto text-sm leading-7 text-slate-500">
                  Choose a preferred location or enter targets like price, ROI,
                  area, or highway distance. Once you apply your brief, we will
                  show the top 20 ranked properties here.
                </p>
              </div>
            )}

            {!loading && !error && hasAppliedPreferences && recommendations.length === 0 && (
              <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                <h3 className="text-2xl font-black text-slate-900">
                  No recommendation signals yet
                </h3>
                <p className="mt-4 max-w-2xl mx-auto text-sm leading-7 text-slate-500">
                  Add a few preference values like location, price, ROI, or area
                  to get a more useful shortlist.
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              recommendations.map((item, index) => (
                <article
                  key={item.property.id}
                  className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.08)]"
                >
                  <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="relative min-h-[280px] bg-slate-200">
                      {item.property.primaryImage || item.property.images?.[0] ? (
                        <img
                          src={assetUrl(
                            item.property.primaryImage || item.property.images[0],
                          )}
                          alt={item.property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                          No image available
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-900 shadow-lg">
                        Rank #{(pagination.page - 1) * pagination.limit + index + 1}
                      </div>

                      <div className="absolute inset-x-4 bottom-4 rounded-3xl bg-slate-950/78 p-4 text-white backdrop-blur">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                              Match
                            </p>
                            <p className="mt-1 text-4xl font-black">
                              {item.matchPercentage}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                              Score
                            </p>
                            <p className="mt-1 text-2xl font-bold text-sky-300">
                              {item.score}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 lg:p-8">
                      <div className="flex flex-col gap-6">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h2 className="text-2xl font-black text-slate-900">
                                {item.property.title}
                              </h2>
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {item.property.category?.name
                                  ? capitalize(item.property.category.name)
                                  : "Uncategorized"}
                              </span>
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {capitalize(item.property.status || "unknown")}
                              </span>
                            </div>

                            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                              {item.property.location}
                            </p>

                            <p className="mt-5 text-sm leading-7 text-slate-600">
                              {item.rankingSummary}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                Price
                              </p>
                              <p className="mt-2 text-lg font-bold text-slate-900">
                                NPR {item.property.price}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                ROI
                              </p>
                              <p className="mt-2 text-lg font-bold text-slate-900">
                                {item.property.roi}%
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                Area
                              </p>
                              <p className="mt-2 text-lg font-bold text-slate-900">
                                {item.property.area}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                Highway
                              </p>
                              <p className="mt-2 text-lg font-bold text-slate-900">
                                {item.property.distanceFromHighway !== undefined
                                  ? `${item.property.distanceFromHighway} m`
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-lg font-bold text-slate-900">
                                Score breakdown
                              </h3>
                              <span className="text-sm text-slate-500">
                                Weighted view
                              </span>
                            </div>

                            <div className="mt-5 space-y-4">
                              {Object.entries(item.scoreBreakdown || {}).length > 0 ? (
                                Object.entries(item.scoreBreakdown || {}).map(
                                  ([key, value]) => {
                                    const maxWeight = scoreWeights[key] || 0;
                                    const widthPercent =
                                      maxWeight > 0
                                        ? Math.min(
                                            100,
                                            Math.max(
                                              0,
                                              (Number(value) / maxWeight) * 100,
                                            ),
                                          )
                                        : 0;

                                    return (
                                    <div key={key}>
                                      <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-600">
                                          {scoreLabels[key] || key}
                                        </span>
                                        <span className="font-bold text-slate-900">
                                          {formatNumber(value)} pts
                                        </span>
                                      </div>
                                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                          className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8_0%,#2563eb_100%)]"
                                          style={{
                                            width: `${widthPercent}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    );
                                  },
                                )
                              ) : (
                                <p className="text-sm leading-7 text-slate-500">
                                  Add more preference values to unlock deeper
                                  scoring detail across every recommendation.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-5">
                              <h3 className="text-lg font-bold text-slate-900">
                                Top reasons
                              </h3>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {item.topReasons.length > 0 ? (
                                  item.topReasons.map((reason) => (
                                    <span
                                      key={reason}
                                      className="rounded-full bg-white px-3 py-2 text-sm text-emerald-700 shadow-sm"
                                    >
                                      {reason}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-500">
                                    No standout positive signal yet.
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="rounded-[28px] border border-amber-100 bg-amber-50 p-5">
                              <h3 className="text-lg font-bold text-slate-900">
                                Watch-outs
                              </h3>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {item.penalties.length > 0 ? (
                                  item.penalties.map((penalty) => (
                                    <span
                                      key={penalty}
                                      className="rounded-full bg-white px-3 py-2 text-sm text-amber-700 shadow-sm"
                                    >
                                      {penalty}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-500">
                                    No major trade-off was detected.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Ranked against:
                            <span className="ml-1 font-semibold text-slate-900">
                              {appliedPreferences.location || "General market fit"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() =>
                                router.push(`/properties/${item.property.id}`)
                              }
                              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              View property
                            </button>
                            <a
                              href={`tel:${contactInfo.phone}`}
                              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Talk to advisor
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

            <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages} from the top 20
                shortlist
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={!pagination.hasPrev}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  disabled={!pagination.hasNext}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recommendations;
