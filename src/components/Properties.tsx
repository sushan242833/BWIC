import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import { capitalize } from "@/utils/Capitalize";
import { APP_ROUTES } from "@/config/routes";
import { assetUrl } from "@/lib/api/client";
import { getCategories } from "@/modules/categories/api";
import {
  getLocationSuggestions,
  LOCATION_AUTOCOMPLETE_DEBOUNCE_MS,
  shouldFetchLocationSuggestions,
} from "@/modules/locations/api";
import { getProperties } from "@/modules/properties/api";
import {
  countActivePropertyFilters,
  defaultPropertyFilters,
  defaultPropertySort,
  type PropertyFilters,
} from "@/modules/properties/filters";
import {
  DEFAULT_HIGHWAY_DISTANCE_KM,
  PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
  PROPERTY_DEFAULT_PAGE_SIZE,
  ROI_OPTIONS,
} from "@/modules/properties/constants";
import type {
  LocationSuggestion,
  PropertySummary,
  PropertiesResponse,
} from "@/modules/properties/types";
import type { CategorySummary } from "@/modules/categories/types";

const defaultPagination = {
  page: 1,
  limit: PROPERTY_DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

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

const formatNumber = (value?: string | number | null): string => {
  const parsed = parseNumericValue(value);
  if (parsed === null) {
    return typeof value === "string" ? value : "N/A";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 1,
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 1,
  }).format(parsed);
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

const getAreaDisplay = (
  property: PropertySummary,
): { value: string; unit: string } => {
  const nepaliArea = property.areaNepali?.trim();

  if (nepaliArea) {
    const match = nepaliArea.match(/^([\d.,]+)\s*(.*)$/);
    if (match) {
      return {
        value: match[1],
        unit: match[2] || "",
      };
    }

    return {
      value: nepaliArea,
      unit: "",
    };
  }

  return {
    value: formatNumber(property.area),
    unit: "sq.ft",
  };
};

const getMetricLabel = (property: PropertySummary): string => {
  const categoryName = property.category?.name?.toLowerCase() ?? "";
  return categoryName.includes("land") ? "Appreciation" : "Investment ROI";
};

const getCategoryLabel = (property: PropertySummary): string =>
  capitalize(property.category?.name ?? "Investment");

const buildPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage, currentPage + 1, "...", totalPages];
};

const fieldClassName =
  "h-11 w-full rounded-xl border border-transparent bg-[#eef0ff] px-4 text-[14px] font-medium text-[#131b2e] outline-none transition placeholder:text-[#6a6f82] focus:border-[#cbd5ff] focus:bg-white focus:ring-4 focus:ring-[#004ac6]/8";

const selectClassName = `${fieldClassName} appearance-none pr-11`;

const Properties = () => {
  const router = useRouter();
  const propertyListRef = useRef<HTMLDivElement>(null);

  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>(
    defaultPropertyFilters,
  );
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilters>(
    defaultPropertyFilters,
  );
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedLocationPlaceId, setSelectedLocationPlaceId] = useState("");
  const [highwayDistanceKm, setHighwayDistanceKm] = useState(
    DEFAULT_HIGHWAY_DISTANCE_KM,
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error("Failed to fetch categories:", fetchError);
      }
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const response = (await getProperties({
          ...appliedFilters,
          search: appliedSearchTerm || undefined,
          sort: defaultPropertySort,
          page: pagination.page,
          limit: pagination.limit,
        })) as PropertiesResponse;

        setProperties(Array.isArray(response?.data) ? response.data : []);
        setPagination(
          response?.pagination
            ? response.pagination
            : {
                ...defaultPagination,
                page: pagination.page,
                limit: pagination.limit,
              },
        );
      } catch (fetchError) {
        console.error("Failed to fetch properties:", fetchError);
        setError("Failed to load properties.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchProperties();
  }, [appliedFilters, appliedSearchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    if (!shouldFetchLocationSuggestions(locationQuery)) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLocationLoading(true);
        const suggestions = await getLocationSuggestions(locationQuery);
        setLocationSuggestions(Array.isArray(suggestions) ? suggestions : []);
      } catch (fetchError) {
        console.error("Failed to fetch location suggestions:", fetchError);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, LOCATION_AUTOCOMPLETE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [locationQuery]);

  const paginationItems = useMemo(
    () => buildPaginationItems(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  );
  const activeFilterCount = useMemo(
    () => countActivePropertyFilters(appliedFilters),
    [appliedFilters],
  );

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setPagination((currentPagination) =>
      currentPagination.page === 1
        ? currentPagination
        : {
            ...currentPagination,
            page: 1,
          },
    );
    setAppliedSearchTerm(searchTerm.trim());
    propertyListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleLocationQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextQuery = event.target.value;
    setLocationQuery(nextQuery);
    setSelectedLocationPlaceId("");
    setIsLocationDropdownOpen(true);
    setFilters((currentFilters) => ({
      ...currentFilters,
      location: nextQuery,
    }));
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setSelectedLocationPlaceId(suggestion.placeId);
    setLocationQuery(suggestion.description);
    setLocationSuggestions([]);
    setIsLocationDropdownOpen(false);
    setFilters((currentFilters) => ({
      ...currentFilters,
      location: suggestion.description,
    }));
  };

  const handleHighwayDistanceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextKm = Number(event.target.value);
    setHighwayDistanceKm(nextKm);
    setFilters((currentFilters) => ({
      ...currentFilters,
      maxDistanceFromHighway: String(Math.round(nextKm * 1000)),
    }));
  };

  const handleApplyFilters = () => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
    }));
    setAppliedFilters(filters);
    propertyListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setFilters(defaultPropertyFilters);
    setAppliedFilters(defaultPropertyFilters);
    setSearchTerm("");
    setAppliedSearchTerm("");
    setLocationQuery("");
    setLocationSuggestions([]);
    setIsLocationDropdownOpen(false);
    setSelectedLocationPlaceId("");
    setHighwayDistanceKm(DEFAULT_HIGHWAY_DISTANCE_KM);
    setPagination((currentPagination) => ({
      ...currentPagination,
      page: 1,
      limit: PROPERTY_DEFAULT_PAGE_SIZE,
    }));
    propertyListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) {
      return;
    }

    setPagination((currentPagination) => ({
      ...currentPagination,
      page,
    }));
    propertyListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showEmptyState = !loading && !error && properties.length === 0;

  return (
    <section className="bg-[radial-gradient(circle_at_top_left,rgba(75,65,225,0.08),transparent_32%),linear-gradient(180deg,#f7f6ff_0%,#faf8ff_100%)] font-auth-body text-[#131b2e]">
      <div className="mx-auto max-w-[1280px] px-6 pb-20 pt-12 md:px-8 md:pb-24 md:pt-16">
        <header className="mb-10 md:mb-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <h1 className="font-auth-headline text-[44px] font-bold leading-[0.94] tracking-[-0.045em] text-[#10182c] sm:text-[56px] lg:text-[64px]">
                <span className="block">Prime Real Estate</span>
                <span className="block text-[#0b46cf]">
                  Investment Opportunities.
                </span>
              </h1>
              <p className="mt-5 max-w-[700px] text-[17px] leading-[1.7] text-[#2f3446] md:text-[18px]">
                Discover high-yield assets in Nepal&apos;s emerging economic
                corridors. From Kathmandu&apos;s commercial hubs to
                Pokhara&apos;s luxury hospitality zones, we curate the
                nation&apos;s most promising architectural milestones.
              </p>
            </div>

            <div className="w-full lg:max-w-[430px]">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0b46cf]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by property ID, name, or location..."
                    className="h-11 w-full rounded-2xl border border-[#e6e8f2] bg-white pl-11 pr-4 text-[14px] text-[#131b2e] shadow-[0_10px_26px_rgba(19,27,46,0.05)] outline-none transition placeholder:text-[#8a8fa1] focus:border-[#bfd0ff] focus:ring-4 focus:ring-[#004ac6]/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterPanelOpen((current) => !current);
                    setIsLocationDropdownOpen(false);
                  }}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-5 text-[12px] font-bold uppercase tracking-[0.18em] transition ${
                    isFilterPanelOpen
                      ? "border-[#0b46cf] bg-[#eef1ff] text-[#0b46cf]"
                      : "border-[#e6e8f2] bg-white text-[#0b46cf] shadow-[0_10px_26px_rgba(19,27,46,0.05)] hover:border-[#bfd0ff]"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-[#0b46cf] px-2 py-0.5 text-[10px] tracking-normal text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button type="submit" className="sr-only">
                  Search
                </button>
              </form>
            </div>
          </div>
        </header>

        {isFilterPanelOpen && (
          <section className="mb-10 rounded-[20px] border border-[#ebe9f6] bg-white/90 p-6 shadow-[0_18px_40px_rgba(19,27,46,0.05)] backdrop-blur-sm md:mb-12 md:p-7">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
            <div className="space-y-2 xl:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#131b2e]">
                Location
              </label>
              <div className="relative">
                <input
                  name="location"
                  value={locationQuery}
                  onChange={handleLocationQueryChange}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                  onBlur={() =>
                    window.setTimeout(
                      () => setIsLocationDropdownOpen(false),
                      PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
                    )
                  }
                  placeholder="All Locations"
                  className={fieldClassName}
                />
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737686]" />

                {isLocationDropdownOpen &&
                  shouldFetchLocationSuggestions(locationQuery) && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[#e3e6f3] bg-white p-2 shadow-[0_16px_30px_rgba(19,27,46,0.08)]">
                      {locationLoading && (
                        <div className="px-3 py-2 text-sm text-[#5f6475]">
                          Loading suggestions...
                        </div>
                      )}

                      {!locationLoading && locationSuggestions.length === 0 && (
                        <div className="px-3 py-2 text-sm text-[#5f6475]">
                          No locations found
                        </div>
                      )}

                      {!locationLoading &&
                        locationSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.placeId}
                            type="button"
                            onClick={() => handleLocationSelect(suggestion)}
                            className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                              selectedLocationPlaceId === suggestion.placeId
                                ? "bg-[#eef0ff] text-[#0b46cf]"
                                : "text-[#131b2e] hover:bg-[#f5f6ff]"
                            }`}
                          >
                            {suggestion.description}
                          </button>
                        ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#131b2e]">
                Category
              </label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className={selectClassName}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {capitalize(category.name)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737686]" />
              </div>
            </div>

            <div className="space-y-2 xl:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#131b2e]">
                Price (NPR)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className={fieldClassName}
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#131b2e]">
                ROI (%)
              </label>
              <div className="relative">
                <select
                  name="minRoi"
                  value={filters.minRoi}
                  onChange={handleFilterChange}
                  className={selectClassName}
                >
                  <option value="">Any ROI</option>
                  {ROI_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737686]" />
              </div>
            </div>
          </div>

            <div className="mt-7 grid grid-cols-1 items-end gap-5 border-t border-[#eceffc] pt-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_auto]">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#131b2e]">
                Minimum Area (Sq. Ft.)
              </label>
              <input
                type="number"
                name="minArea"
                value={filters.minArea}
                onChange={handleFilterChange}
                placeholder="e.g. 1500"
                className={fieldClassName}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#131b2e]">
                  Highway Proximity (km)
                </label>
                <span className="rounded-full bg-[#eef0ff] px-3 py-1 text-[11px] font-semibold text-[#0b46cf]">
                  {highwayDistanceKm} km
                </span>
              </div>
              <div className="flex h-11 items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={highwayDistanceKm}
                  onChange={handleHighwayDistanceChange}
                  aria-label="Highway proximity in kilometres"
                  className="properties-range w-full"
                  style={{
                    background: `linear-gradient(90deg, #0b46cf 0%, #0b46cf ${
                      (highwayDistanceKm / 10) * 100
                    }%, #dbe1ff ${(highwayDistanceKm / 10) * 100}%, #dbe1ff 100%)`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:w-[320px]">
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-11 rounded-xl bg-[#dbe1ff] px-5 text-[12px] font-bold uppercase tracking-[0.2em] text-[#0b46cf] transition hover:bg-[#cbd5ff]"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="h-11 rounded-xl bg-[linear-gradient(135deg,#0b46cf_0%,#4b41e1_100%)] px-5 text-[12px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_20px_rgba(11,70,207,0.22)] transition hover:brightness-[1.03]"
              >
                Apply Filters
              </button>
            </div>
            </div>
          </section>
        )}

        <div
          ref={propertyListRef}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
        >
          {loading &&
            Array.from({ length: PROPERTY_DEFAULT_PAGE_SIZE }, (_, index) => (
              <div
                key={`property-skeleton-${index}`}
                className="overflow-hidden rounded-[18px] border border-[#e7e8f1] bg-white/70 shadow-[0_10px_28px_rgba(19,27,46,0.04)]"
              >
                <div className="h-[214px] animate-pulse bg-[#e6eaff]" />
                <div className="space-y-4 p-5">
                  <div className="h-3 w-28 animate-pulse rounded-full bg-[#e6eaff]" />
                  <div className="h-7 w-2/3 animate-pulse rounded-xl bg-[#e6eaff]" />
                  <div className="grid grid-cols-2 gap-4 border-y border-[#edf0fb] py-5">
                    <div className="space-y-3">
                      <div className="h-3 w-20 animate-pulse rounded-full bg-[#e6eaff]" />
                      <div className="h-6 w-16 animate-pulse rounded-xl bg-[#e6eaff]" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-20 animate-pulse rounded-full bg-[#e6eaff]" />
                      <div className="h-6 w-20 animate-pulse rounded-xl bg-[#e6eaff]" />
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-3">
                      <div className="h-3 w-24 animate-pulse rounded-full bg-[#e6eaff]" />
                      <div className="h-7 w-40 animate-pulse rounded-xl bg-[#e6eaff]" />
                    </div>
                    <div className="h-4 w-24 animate-pulse rounded-full bg-[#e6eaff]" />
                  </div>
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="col-span-full rounded-[20px] border border-[#f0d3d3] bg-white px-6 py-14 text-center text-[#b42318] shadow-[0_12px_28px_rgba(19,27,46,0.03)]">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            properties.map((property) => {
              const areaDisplay = getAreaDisplay(property);
              const primaryImage =
                property.primaryImage ?? property.images?.[0];

              return (
                <article
                  key={property.id}
                  onClick={() =>
                    router.push(APP_ROUTES.propertyDetail(property.id))
                  }
                  className="group cursor-pointer overflow-hidden rounded-[18px] border border-[#e7e8f1] bg-white shadow-[0_10px_28px_rgba(19,27,46,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(19,27,46,0.08)]"
                >
                  <div className="relative h-[214px] overflow-hidden bg-[#dfe5ff]">
                    {primaryImage ? (
                      <img
                        src={assetUrl(primaryImage)}
                        alt={property.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbe1ff_0%,#eef1ff_100%)]">
                        <span className="font-auth-headline text-2xl font-bold text-[#0b46cf]">
                          {property.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full bg-[linear-gradient(135deg,#5a53f5_0%,#726bff_100%)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(75,65,225,0.18)]">
                      {getCategoryLabel(property)}
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#0b46cf]">
                      {property.location}
                    </p>
                    <h3 className="mt-2 font-auth-headline text-[19px] font-bold leading-tight text-[#131b2e] transition-colors group-hover:text-[#0b46cf] sm:text-[20px]">
                      {property.title}
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#edf0fb] py-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#72778a]">
                          {getMetricLabel(property)}
                        </p>
                        <p className="mt-2 text-[18px] font-semibold text-[#131b2e]">
                          {formatPercent(property.roi)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#72778a]">
                          Total Area
                        </p>
                        <p className="mt-2 text-[18px] font-semibold text-[#131b2e]">
                          {areaDisplay.value}
                          {areaDisplay.unit && (
                            <span className="ml-1 text-[14px] font-medium text-[#5b6174]">
                              {areaDisplay.unit}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#72778a]">
                          Investment Ask
                        </p>
                        <p className="mt-2 text-[19px] font-semibold text-[#0b46cf] sm:text-[20px]">
                          {formatCurrency(property.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void router.push(
                            APP_ROUTES.propertyDetail(property.id),
                          );
                        }}
                        className="border-b border-[#c8d4ff] pb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0b46cf] transition hover:border-[#0b46cf]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

          {showEmptyState && (
            <div className="col-span-full flex flex-col items-center rounded-[24px] border border-dashed border-[#d8def6] bg-white/80 px-6 py-16 text-center shadow-[0_12px_28px_rgba(19,27,46,0.03)]">
              <div className="rounded-full bg-[#eef1ff] p-4 text-[#9aa2c8]">
                <SearchX className="h-8 w-8" />
              </div>
              <h3 className="mt-6 font-auth-headline text-[28px] font-bold text-[#131b2e]">
                No properties match your criteria
              </h3>
              <p className="mt-3 max-w-[520px] text-[16px] leading-7 text-[#5b6174]">
                Try adjusting your filters or search for a different location.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-8 border-b border-[#0b46cf] pb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-[#0b46cf]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {!loading && !error && pagination.totalPages > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#687086] shadow-[0_6px_16px_rgba(19,27,46,0.04)] transition hover:bg-[#eef1ff] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {paginationItems.map((item, index) =>
              typeof item === "string" ? (
                <span key={`ellipsis-${index}`} className="px-2 text-[#687086]">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageChange(item)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                    item === pagination.page
                      ? "bg-[#0b46cf] text-white shadow-[0_10px_20px_rgba(11,70,207,0.22)]"
                      : "bg-white text-[#131b2e] shadow-[0_6px_16px_rgba(19,27,46,0.04)] hover:bg-[#eef1ff]"
                  }`}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#687086] shadow-[0_6px_16px_rgba(19,27,46,0.04)] transition hover:bg-[#eef1ff] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default Properties;
