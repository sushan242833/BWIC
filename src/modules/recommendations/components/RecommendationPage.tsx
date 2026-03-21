import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import {
  buildRecommendationPreferencesPayload,
  getRecommendations,
} from "@/modules/recommendations/api";
import RecommendationResults from "@/modules/recommendations/components/RecommendationResults";
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

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100";

const defaultPagination: RecommendationPagination = {
  page: 1,
  limit: DEFAULT_RECOMMENDATION_PAGE_SIZE,
  total: 0,
  totalPages: EMPTY_TOTAL_PAGES,
  hasNext: false,
  hasPrev: false,
};

const RecommendationPage = () => {
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

  const appliedPayload = useMemo(
    () => buildRecommendationPreferencesPayload(appliedPreferences),
    [appliedPreferences],
  );

  const hasAppliedPreferences = useMemo(
    () => Object.values(appliedPayload).some((value) => value !== undefined),
    [appliedPayload],
  );

  const activePreferenceCount = useMemo(
    () =>
      Object.values(appliedPayload).filter((value) => value !== undefined)
        .length,
    [appliedPayload],
  );

  const requiresLocationSelection =
    preferences.location.trim().length > 0 && !selectedPlaceId;
  const topMatch = recommendations[0];

  useEffect(() => {
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

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getRecommendations({
          preferences: {
            ...appliedPayload,
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
    appliedPayload,
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
        setLocationSuggestions(
          Array.isArray(payload?.data) ? payload.data : [],
        );
      } catch (fetchError) {
        console.error(
          "Failed to fetch recommendation location suggestions:",
          fetchError,
        );
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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
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
    setError("");
    setPagination((prev) => ({ ...defaultPagination, limit: prev.limit }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageChange = (page: number) => {
    if (page === pagination.page || page < 1 || page > pagination.totalPages) {
      return;
    }

    setPagination((prev) => ({ ...prev, page }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7f7_100%)] text-slate-900">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#071120_0%,#0b2447_50%,#0f766e_100%)] text-white">
        <div className="absolute inset-0">
          <div className="absolute left-[-6rem] top-10 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute right-[-4rem] top-0 h-96 w-96 rounded-full bg-teal-200/15 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-blue-200/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-50">
                Smart Recommendations
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-5xl">
                Find investment properties aligned with your goals.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Set your preferences once and explore highly relevant property
                matches with clear ranking signals, transparent scoring, and an
                experience designed to help you decide faster.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {topMatch ? (
                <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-slate-200">Top ranked match</p>
                  <p className="mt-2 text-4xl font-black text-white">
                    {topMatch.matchPercentage}%
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {topMatch.property.title}
                  </p>
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="hidden rounded-[28px] sm:block"
                />
              )}
              <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">Recommendation mode</p>
                <p className="mt-2 text-3xl font-black text-white">
                  Curated ranking
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Each result includes a match score, ranking reason, and
                  trade-off summary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto -mt-12 max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Recommendation Brief
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  Define your ideal investment profile
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Set the location and signals that matter most to you, then
                  review a recommendation-first results experience instead of a
                  standard browse list.
                </p>
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
                                ? "bg-cyan-50 text-cyan-800"
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
                  type="button"
                  onClick={applyBrief}
                  disabled={requiresLocationSelection}
                  className="rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generate recommendations
                </button>
                <button
                  type="button"
                  onClick={clearBrief}
                  className="rounded-2xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset brief
                </button>
              </div>
            </div>

            {requiresLocationSelection && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Please choose one of the suggested locations so the
                recommendation request can include accurate coordinates.
              </div>
            )}

            {selectedPlaceDetails && (
              <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-slate-700">
                Selected location:
                <span className="ml-1 font-semibold text-slate-900">
                  {selectedPlaceDetails.primaryText}
                </span>
              </div>
            )}
          </section>

          <div ref={resultsRef}>
            <RecommendationResults
              recommendations={recommendations}
              pagination={pagination}
              loading={loading}
              error={error}
              hasAppliedPreferences={hasAppliedPreferences}
              appliedPreferences={appliedPreferences}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendationPage;
