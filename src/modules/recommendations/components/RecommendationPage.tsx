import React, { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, MapPinned } from "lucide-react";
import {
  getLocationPlaceDetails,
  getLocationSuggestions,
  LOCATION_AUTOCOMPLETE_DEBOUNCE_MS,
  shouldFetchLocationSuggestions,
} from "@/modules/locations/api";
import {
  buildRecommendationPreferencesPayload,
  getRecommendations,
} from "@/modules/recommendations/api";
import RecommendationResults from "@/modules/recommendations/components/RecommendationResults";
import {
  DEFAULT_RECOMMENDATION_FORM_VALUES,
  DEFAULT_RECOMMENDATION_PAGINATION,
  EMPTY_RECOMMENDATION_TOTAL_PAGES,
  RECOMMENDATION_FORM_TEXT,
  RECOMMENDATION_RANGE_LIMITS,
} from "@/modules/recommendations/constants";
import type {
  RecommendationDetectedEntity,
  RecommendationItem,
  RecommendationLocationSuggestion,
  RecommendationPagination,
  RecommendationParsedBriefMetadata,
  RecommendationPlaceDetails,
  RecommendationPreferences,
} from "@/modules/recommendations/types";
import { defaultRecommendationPreferences } from "@/modules/recommendations/types";

const formFieldClassName =
  "w-full rounded-xl border border-[#e1e7fb] bg-[#f4f6ff] px-4 py-4 font-auth-body text-base text-[#131b2e] outline-none transition placeholder:text-[#7d8296] focus:border-[#7fa3ff] focus:bg-white focus:ring-4 focus:ring-[#dbe6ff]";

const labelClassName =
  "font-auth-body text-sm font-semibold uppercase tracking-[0.14em] text-[#434655]";

const formatNumber = (value: string, maximumFractionDigits = 1) => {
  const numeric = Number.parseFloat(value.replace(/,/g, ""));
  if (Number.isNaN(numeric)) {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits:
      numeric % 1 === 0 ? 0 : Math.min(1, maximumFractionDigits),
  }).format(numeric);
};

const formatMetricValue = (value: number, suffix = "") => {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);

  return suffix ? `${formatted}${suffix}` : formatted;
};

const getRangeInputValue = (value: string, fallback: number) =>
  value.trim() ? value : String(fallback);

const formatOptionalRangeValue = (value: string, suffix = "") => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Any";
  }

  return formatMetricValue(Number.parseFloat(trimmed), suffix);
};

const formatCurrencyValue = (value: number) =>
  `NPR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value)}`;

const buildRangeBackground = (value: string, min: number, max: number) => {
  const numeric = Number.parseFloat(value);
  const normalized = Number.isNaN(numeric) ? min : numeric;
  const ratio = ((normalized - min) / (max - min)) * 100;
  const safeRatio = Math.min(100, Math.max(0, ratio));

  return {
    background: `linear-gradient(90deg, #004ac6 0%, #004ac6 ${safeRatio}%, #dbe1ff ${safeRatio}%, #dbe1ff 100%)`,
  };
};

const hasStructuredPreferences = (value: RecommendationPreferences) =>
  Boolean(
    value.location.trim() ||
      value.price.trim() ||
      value.area.trim() ||
      Number.parseFloat(value.roi) > 0 ||
      Number.parseFloat(value.maxDistanceFromHighway) > 0,
  );

const formatDetectedEntity = (entity: RecommendationDetectedEntity): string => {
  switch (entity.type) {
    case "category":
      return `Category: ${String(entity.value)}`;
    case "location":
      return `Location: ${String(entity.value)}`;
    case "maxPrice":
      return `Budget up to ${formatCurrencyValue(Number(entity.value))}`;
    case "preferredPrice":
      return `Preferred price ${formatCurrencyValue(Number(entity.value))}`;
    case "minRoi":
      return `ROI at least ${formatMetricValue(Number(entity.value), "%")}`;
    case "preferredRoi":
      return `Preferred ROI ${formatMetricValue(Number(entity.value), "%")}`;
    case "minArea":
      return `Area at least ${formatMetricValue(Number(entity.value))} sq ft`;
    case "preferredArea":
      return `Preferred area ${formatMetricValue(Number(entity.value))} sq ft`;
    case "maxDistanceFromHighway":
      return `Highway distance up to ${formatMetricValue(Number(entity.value))} km`;
    case "status":
      return `Status: ${String(entity.value)}`;
    default:
      return String(entity.value);
  }
};

const buildAppliedSummary = (
  metadata: RecommendationParsedBriefMetadata | null,
): string[] => {
  if (!metadata) {
    return [];
  }

  const summary: string[] = [];
  const { appliedFilters, appliedPreferences } = metadata;

  if (appliedFilters.category) {
    summary.push(`Category: ${appliedFilters.category}`);
  }

  if (appliedFilters.location) {
    summary.push(`Location: ${appliedFilters.location}`);
  }

  if (appliedFilters.maxPrice !== undefined) {
    summary.push(`Budget up to ${formatCurrencyValue(appliedFilters.maxPrice)}`);
  }

  if (appliedFilters.minRoi !== undefined) {
    summary.push(`ROI at least ${formatMetricValue(appliedFilters.minRoi, "%")}`);
  } else if (appliedPreferences.roi !== undefined && appliedPreferences.roi > 0) {
    summary.push(`Preferred ROI ${formatMetricValue(appliedPreferences.roi, "%")}`);
  }

  if (appliedFilters.minArea !== undefined) {
    summary.push(`Area at least ${formatMetricValue(appliedFilters.minArea)} sq ft`);
  } else if (appliedPreferences.area !== undefined && appliedPreferences.area > 0) {
    summary.push(
      `Preferred area ${formatMetricValue(appliedPreferences.area)} sq ft`,
    );
  }

  if (appliedFilters.maxDistanceFromHighway !== undefined) {
    summary.push(
      `Highway distance up to ${formatMetricValue(
        appliedFilters.maxDistanceFromHighway,
      )} km`,
    );
  } else if (
    appliedPreferences.maxDistanceFromHighway !== undefined &&
    appliedPreferences.maxDistanceFromHighway > 0
  ) {
    summary.push(
      `Preferred highway distance ${formatMetricValue(
        appliedPreferences.maxDistanceFromHighway,
      )} km`,
    );
  }

  if (
    appliedPreferences.price !== undefined &&
    appliedPreferences.price > 0 &&
    appliedFilters.maxPrice === undefined
  ) {
    summary.push(`Preferred price ${formatCurrencyValue(appliedPreferences.price)}`);
  }

  return summary;
};

const RecommendationPage = () => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const [preferences, setPreferences] = useState<RecommendationPreferences>(
    DEFAULT_RECOMMENDATION_FORM_VALUES,
  );
  const [appliedPreferences, setAppliedPreferences] =
    useState<RecommendationPreferences>(defaultRecommendationPreferences);
  const [appliedBrief, setAppliedBrief] = useState("");
  const [recommendationMeta, setRecommendationMeta] =
    useState<RecommendationParsedBriefMetadata | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    [],
  );
  const [pagination, setPagination] = useState<RecommendationPagination>(
    DEFAULT_RECOMMENDATION_PAGINATION,
  );
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
    () =>
      Boolean(appliedBrief.trim()) || hasStructuredPreferences(appliedPreferences),
    [appliedBrief, appliedPreferences],
  );

  const appliedSummary = useMemo(
    () => buildAppliedSummary(recommendationMeta),
    [recommendationMeta],
  );

  const shouldShowParsedSummary = useMemo(
    () =>
      Boolean(
        recommendationMeta &&
          (recommendationMeta.brief ||
            recommendationMeta.detectedEntities.length > 0 ||
            recommendationMeta.warnings.length > 0 ||
            appliedSummary.length > 0),
      ),
    [appliedSummary, recommendationMeta],
  );

  const requiresLocationSelection =
    preferences.location.trim().length > 0 && !selectedPlaceId;

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getRecommendations({
          brief: appliedBrief,
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
        setRecommendationMeta(response.meta?.parsedBrief ?? null);
        setPagination((prev) =>
          response.pagination
            ? response.pagination
            : {
                ...prev,
                total: 0,
                totalPages: EMPTY_RECOMMENDATION_TOTAL_PAGES,
                hasNext: false,
                hasPrev: false,
              },
        );
      } catch (fetchError) {
        console.error("Failed to fetch recommendations:", fetchError);
        setRecommendations([]);
        setRecommendationMeta(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : RECOMMENDATION_FORM_TEXT.loadError,
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchRecommendations();
  }, [
    appliedBrief,
    appliedPayload,
    appliedPlaceDetails,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    if (!shouldFetchLocationSuggestions(preferences.location)) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const suggestions = await getLocationSuggestions(preferences.location);
        setLocationSuggestions(Array.isArray(suggestions) ? suggestions : []);
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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      const placeDetails = await getLocationPlaceDetails(suggestion.placeId);
      setSelectedPlaceDetails(placeDetails ?? null);
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
    setAppliedBrief(preferences.brief.trim());
    setAppliedPlaceDetails(selectedPlaceDetails);
    setPagination((prev) => ({ ...prev, page: 1 }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearBrief = () => {
    setPreferences(DEFAULT_RECOMMENDATION_FORM_VALUES);
    setAppliedPreferences(defaultRecommendationPreferences);
    setAppliedBrief("");
    setRecommendationMeta(null);
    setSelectedPlaceId("");
    setSelectedPlaceDetails(null);
    setAppliedPlaceDetails(null);
    setLocationSuggestions([]);
    setIsLocationDropdownOpen(false);
    setError("");
    setPagination((prev) => ({
      ...DEFAULT_RECOMMENDATION_PAGINATION,
      limit: prev.limit,
    }));
  };

  const handlePageChange = (page: number) => {
    if (page === pagination.page || page < 1 || page > pagination.totalPages) {
      return;
    }

    setPagination((prev) => ({ ...prev, page }));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyBrief();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <header className="relative overflow-hidden px-0 pb-8 pt-6">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#dbe1ff] blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-auth-headline text-5xl font-bold tracking-tight text-[#131b2e] md:text-7xl">
            Find your perfect{" "}
            <span className="text-[#004ac6]">investment match</span>
          </h1>
          <p className="mt-6 max-w-2xl font-auth-body text-xl leading-10 text-[#434655]">
            Leveraging advanced spatial data analytics and market trends, we
            curate bespoke real estate opportunities across Nepal&apos;s most
            promising economic corridors.
          </p>
        </div>
      </header>

      <section className="mt-10 rounded-[28px] border border-[#e3e7f6] bg-white p-8 shadow-[0_24px_70px_rgba(19,27,46,0.06)] sm:p-10">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dbe1ff] text-[#004ac6]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h2 className="font-auth-headline text-3xl font-semibold text-[#131b2e]">
            Recommendation Brief
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3"
        >
          <div className="space-y-3 lg:col-span-3">
            <label className={labelClassName}>Free-Text Property Brief</label>
            <textarea
              name="brief"
              value={preferences.brief}
              onChange={handlePreferenceChange}
              placeholder={RECOMMENDATION_FORM_TEXT.briefPlaceholder}
              className={`${formFieldClassName} min-h-[140px] resize-y`}
            />
            <p className="font-auth-body text-sm text-[#5b6275]">
              Type a natural-language brief, keep using the structured fields
              below, or combine both. Structured inputs override parsed brief
              values when they overlap.
            </p>
          </div>

          <div className="space-y-3">
            <label className={labelClassName}>Preferred Location</label>
            <div className="relative" ref={locationRef}>
              <input
                name="location"
                value={preferences.location}
                onChange={handlePreferenceChange}
                onFocus={() => setIsLocationDropdownOpen(true)}
                placeholder={RECOMMENDATION_FORM_TEXT.locationPlaceholder}
                className={formFieldClassName}
              />

              {isLocationDropdownOpen &&
                shouldFetchLocationSuggestions(preferences.location) && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#dfe5f8] bg-white shadow-xl">
                    {locationLoading && (
                      <div className="px-4 py-3 font-auth-body text-sm text-[#5b6275]">
                        {RECOMMENDATION_FORM_TEXT.locationLoading}
                      </div>
                    )}

                    {!locationLoading && locationSuggestions.length === 0 && (
                      <div className="px-4 py-3 font-auth-body text-sm text-[#5b6275]">
                        {RECOMMENDATION_FORM_TEXT.locationEmpty}
                      </div>
                    )}

                    {!locationLoading &&
                      locationSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.placeId}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
                          className={`block w-full border-b border-[#eef1fb] px-4 py-3 text-left font-auth-body text-sm transition last:border-b-0 hover:bg-[#f5f7ff] ${
                            selectedPlaceId === suggestion.placeId
                              ? "bg-[#eef2ff] text-[#004ac6]"
                              : "text-[#434655]"
                          }`}
                        >
                          {suggestion.description}
                        </button>
                      ))}
                  </div>
                )}
            </div>
          </div>

          <div className="space-y-3">
            <label className={labelClassName}>Ideal Price (NPR)</label>
            <input
              type="number"
              name="price"
              value={preferences.price}
              onChange={handlePreferenceChange}
              placeholder={RECOMMENDATION_FORM_TEXT.pricePlaceholder}
              className={formFieldClassName}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className={labelClassName}>Target ROI (%)</label>
              <span className="font-auth-headline text-2xl font-semibold text-[#004ac6]">
                {formatOptionalRangeValue(preferences.roi, "%")}
              </span>
            </div>
            <input
              type="range"
              name="roi"
              min={RECOMMENDATION_RANGE_LIMITS.roi.min}
              max={RECOMMENDATION_RANGE_LIMITS.roi.max}
              step={RECOMMENDATION_RANGE_LIMITS.roi.step}
              value={getRangeInputValue(
                preferences.roi,
                RECOMMENDATION_RANGE_LIMITS.roi.min,
              )}
              onChange={handlePreferenceChange}
              className="properties-range w-full"
              style={buildRangeBackground(
                getRangeInputValue(
                  preferences.roi,
                  RECOMMENDATION_RANGE_LIMITS.roi.min,
                ),
                RECOMMENDATION_RANGE_LIMITS.roi.min,
                RECOMMENDATION_RANGE_LIMITS.roi.max,
              )}
            />
          </div>

          <div className="space-y-3">
            <label className={labelClassName}>Ideal Area (Sq. Ft.)</label>
            <input
              type="text"
              name="area"
              value={preferences.area}
              onChange={handlePreferenceChange}
              placeholder={RECOMMENDATION_FORM_TEXT.areaPlaceholder}
              className={formFieldClassName}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className={labelClassName}>
                Max Distance From Highway (km)
              </label>
              <span className="font-auth-headline text-2xl font-semibold text-[#004ac6]">
                {formatOptionalRangeValue(
                  preferences.maxDistanceFromHighway,
                  " km",
                )}
              </span>
            </div>
            <input
              type="range"
              name="maxDistanceFromHighway"
              min={RECOMMENDATION_RANGE_LIMITS.distance.min}
              max={RECOMMENDATION_RANGE_LIMITS.distance.max}
              step={RECOMMENDATION_RANGE_LIMITS.distance.step}
              value={getRangeInputValue(
                preferences.maxDistanceFromHighway,
                RECOMMENDATION_RANGE_LIMITS.distance.min,
              )}
              onChange={handlePreferenceChange}
              className="properties-range w-full"
              style={buildRangeBackground(
                getRangeInputValue(
                  preferences.maxDistanceFromHighway,
                  RECOMMENDATION_RANGE_LIMITS.distance.min,
                ),
                RECOMMENDATION_RANGE_LIMITS.distance.min,
                RECOMMENDATION_RANGE_LIMITS.distance.max,
              )}
            />
          </div>

          <div className="flex flex-col justify-end gap-4">
            <button
              type="submit"
              disabled={requiresLocationSelection}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#004ac6_0%,#4b41e1_100%)] px-6 py-4 text-center font-auth-body text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-[#004ac6]/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {RECOMMENDATION_FORM_TEXT.generateButton}
            </button>
            <button
              type="button"
              onClick={clearBrief}
              className="font-auth-body text-xs font-semibold uppercase tracking-[0.18em] text-[#004ac6] transition hover:underline"
            >
              {RECOMMENDATION_FORM_TEXT.resetButton}
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {requiresLocationSelection && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 font-auth-body text-sm text-amber-800">
              {RECOMMENDATION_FORM_TEXT.requiresLocationSelection}
            </div>
          )}

          {selectedPlaceDetails && (
            <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-[#dbe6ff] bg-[#eef2ff] px-4 py-3 font-auth-body text-sm text-[#434655]">
              <MapPinned className="h-4 w-4 text-[#004ac6]" />
              <span className="font-semibold text-[#131b2e]">
                {RECOMMENDATION_FORM_TEXT.selectedLocationLabel}:
              </span>
              <span>{selectedPlaceDetails.primaryText}</span>
            </div>
          )}
        </div>

        {shouldShowParsedSummary && recommendationMeta && (
          <div className="mt-8 rounded-[24px] border border-[#dbe6ff] bg-[#f7f9ff] p-6">
            <div className="space-y-2">
              <h3 className="font-auth-headline text-2xl font-semibold text-[#131b2e]">
                Request Summary
              </h3>
              {recommendationMeta.brief && (
                <p className="font-auth-body text-sm leading-7 text-[#5b6275]">
                  &quot;{recommendationMeta.brief}&quot;
                </p>
              )}
            </div>

            {recommendationMeta.detectedEntities.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 font-auth-body text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6275]">
                  Detected Entities
                </p>
                <div className="flex flex-wrap gap-3">
                  {recommendationMeta.detectedEntities.map((entity) => (
                    <span
                      key={`${entity.type}-${entity.raw}`}
                      className="rounded-full border border-[#d6defb] bg-white px-4 py-2 font-auth-body text-sm text-[#283044]"
                    >
                      {formatDetectedEntity(entity)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {appliedSummary.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 font-auth-body text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6275]">
                  Applied Filters And Preferences
                </p>
                <div className="flex flex-wrap gap-3">
                  {appliedSummary.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#bfd0ff] bg-[#eef3ff] px-4 py-2 font-auth-body text-sm font-medium text-[#004ac6]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recommendationMeta.warnings.length > 0 && (
              <div className="mt-5 space-y-3">
                <p className="font-auth-body text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5a00]">
                  Warnings
                </p>
                {recommendationMeta.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 font-auth-body text-sm text-amber-900"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <div ref={resultsRef} className="mt-20">
        <RecommendationResults
          recommendations={recommendations}
          pagination={pagination}
          loading={loading}
          error={error}
          hasActiveFilters={hasAppliedPreferences}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default RecommendationPage;
