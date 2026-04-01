import React, { useCallback, useEffect, useMemo, useState } from "react";
import router from "next/router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { assetUrl } from "@/lib/api/client";
import { deleteProperty, getProperties } from "@/modules/properties/api";
import {
  formatPropertyStatus,
  normalizePropertyStatus,
} from "@/modules/properties/status";
import type { PropertySummary } from "@/modules/properties/types";

const ADMIN_PAGE_SIZE = 5;
const PROPERTY_FETCH_LIMIT = 50;

interface PropertyFilters {
  location: string;
  status: string;
  category: string;
}

const defaultFilters: PropertyFilters = {
  location: "",
  status: "",
  category: "",
};

const fieldClassName =
  "h-14 w-full appearance-none rounded-2xl border border-transparent bg-[#dfe5ff] px-5 pr-12 text-[1rem] font-medium text-[#131b2e] outline-none transition focus:border-[#b9c8ff] focus:bg-white focus:ring-4 focus:ring-[#004ac6]/10";

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

const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);

const formatCurrency = (value?: string | number | null): string => {
  const parsed = parseNumericValue(value);

  if (parsed === null) {
    return value ? `रू ${value}` : "रू N/A";
  }

  if (parsed >= 10_000_000) {
    return `रू ${formatCompactNumber(parsed / 10_000_000)} Crore`;
  }

  if (parsed >= 100_000) {
    return `रू ${formatCompactNumber(parsed / 100_000)} Lakh`;
  }

  return `रू ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(parsed)}`;
};

const formatPercent = (value?: string | number | null): string => {
  const parsed = parseNumericValue(value);
  if (parsed === null) {
    return "N/A";
  }

  return `${formatCompactNumber(parsed)}%`;
};

const titleCase = (value: string): string =>
  value.replace(/\b\w/g, (character) => character.toUpperCase());

const getPropertyReference = (id: number): string =>
  `#BW-${String(id).padStart(4, "0")}`;

const getPrimaryImage = (property: PropertySummary): string | null =>
  property.primaryImage ?? property.images?.[0] ?? null;

const getStatusMeta = (status?: string | null) => {
  switch (normalizePropertyStatus(status)) {
    case "Available":
      return {
        label: "Active",
        className: "bg-[#daf8df] text-[#18803d]",
      };
    case "Pending":
      return {
        label: "Pending",
        className: "bg-[#fff0bf] text-[#ab6a00]",
      };
    case "Sold":
      return {
        label: "Sold",
        className: "bg-[#ffdfe0] text-[#c41f1f]",
      };
    default:
      return {
        label: formatPropertyStatus(status),
        className: "bg-[#eceff7] text-[#4b5568]",
      };
  }
};

const buildPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 2) {
    return [1, 2, 3, "...", totalPages];
  }

  if (currentPage >= totalPages - 1) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage, currentPage + 1, "...", totalPages];
};

const SortChevron = () => (
  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5b6275]" />
);

export default function PropertiesTable() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const firstPage = await getProperties({
        page: 1,
        limit: PROPERTY_FETCH_LIMIT,
      });

      const firstBatch = firstPage.data ?? [];
      const totalPages = Math.max(firstPage.pagination?.totalPages ?? 1, 1);

      if (totalPages === 1) {
        setProperties(firstBatch);
        return;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          getProperties({
            page: index + 2,
            limit: PROPERTY_FETCH_LIMIT,
          }),
        ),
      );

      setProperties([
        ...firstBatch,
        ...remainingPages.flatMap((payload) => payload.data ?? []),
      ]);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setErrorMsg(
        "Cannot connect to backend server. Please make sure it’s running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          properties
            .map((property) => property.location?.trim())
            .filter(Boolean) as string[],
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [properties],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          properties.map(
            (property) => property.category?.name?.trim() || "Uncategorized",
          ),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesLocation =
        !filters.location || property.location === filters.location;
      const propertyCategory = property.category?.name?.trim() || "Uncategorized";
      const matchesCategory =
        !filters.category || propertyCategory === filters.category;
      const matchesStatus =
        !filters.status || normalizePropertyStatus(property.status) === filters.status;

      return matchesLocation && matchesCategory && matchesStatus;
    });
  }, [filters.category, filters.location, filters.status, properties]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ADMIN_PAGE_SIZE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.category, filters.location, filters.status]);

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ADMIN_PAGE_SIZE;
    return filteredProperties.slice(startIndex, startIndex + ADMIN_PAGE_SIZE);
  }, [currentPage, filteredProperties]);

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const showingFrom =
    filteredProperties.length === 0 ? 0 : (currentPage - 1) * ADMIN_PAGE_SIZE + 1;
  const showingTo = Math.min(
    currentPage * ADMIN_PAGE_SIZE,
    filteredProperties.length,
  );

  const handleFilterChange =
    (key: keyof PropertyFilters) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((previous) => ({
        ...previous,
        [key]: event.target.value,
      }));
    };

  const handleDelete = async (propertyId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(propertyId);
      await deleteProperty(propertyId);
      setProperties((previous) =>
        previous.filter((property) => property.id !== propertyId),
      );
    } catch (err) {
      console.error("Failed to delete property:", err);
      window.alert("Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  const renderSkeletonRows = () =>
    Array.from({ length: ADMIN_PAGE_SIZE }, (_, index) => (
      <tr key={`property-loading-${index}`} className="bg-white">
        <td className="px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-[#e9edff]" />
            <div className="space-y-3">
              <div className="h-5 w-48 animate-pulse rounded-full bg-[#e9edff]" />
              <div className="h-4 w-24 animate-pulse rounded-full bg-[#f0f3ff]" />
            </div>
          </div>
        </td>
        {Array.from({ length: 5 }, (_, columnIndex) => (
          <td key={columnIndex} className="px-4 py-5">
            <div className="h-5 w-24 animate-pulse rounded-full bg-[#eef1ff]" />
          </td>
        ))}
        <td className="px-5 py-5 sm:px-8">
          <div className="ml-auto flex w-fit gap-3">
            {Array.from({ length: 3 }, (_, actionIndex) => (
              <div
                key={actionIndex}
                className="h-10 w-10 animate-pulse rounded-full bg-[#eef1ff]"
              />
            ))}
          </div>
        </td>
      </tr>
    ));

  if (errorMsg) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(19,27,46,0.08)]">
          <h2 className="font-auth-headline text-3xl font-bold text-[#b42318]">
            {errorMsg}
          </h2>
          <button
            type="button"
            onClick={() => void fetchProperties()}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#004ac6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003da4]"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="rounded-[2rem] bg-white p-5 shadow-[0_24px_70px_rgba(19,27,46,0.06)] sm:p-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            <label className="block">
              <span className="mb-3 ml-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-[#1b2236]">
                Location
              </span>
              <span className="relative block">
                <select
                  value={filters.location}
                  onChange={handleFilterChange("location")}
                  className={fieldClassName}
                >
                  <option value="">All Locations</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <SortChevron />
              </span>
            </label>

            <label className="block">
              <span className="mb-3 ml-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-[#1b2236]">
                Status
              </span>
              <span className="relative block">
                <select
                  value={filters.status}
                  onChange={handleFilterChange("status")}
                  className={fieldClassName}
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Sold">Sold</option>
                </select>
                <SortChevron />
              </span>
            </label>

            <label className="block">
              <span className="mb-3 ml-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-[#1b2236]">
                Asset Category
              </span>
              <span className="relative block">
                <select
                  value={filters.category}
                  onChange={handleFilterChange("category")}
                  className={fieldClassName}
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {titleCase(category)}
                    </option>
                  ))}
                </select>
                <SortChevron />
              </span>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setFilters(defaultFilters)}
                className="h-14 w-full rounded-2xl bg-[#dfe5ff] px-5 text-[1rem] font-bold text-[#131b2e] transition hover:bg-[#d1d9ff]"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] bg-[#eef0ff] shadow-[0_24px_70px_rgba(19,27,46,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1160px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e4e8fb] bg-[#eef0ff]">
                  <th className="px-5 py-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1a2135] sm:px-8">
                    Property
                  </th>
                  <th className="px-4 py-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1a2135]">
                    Category
                  </th>
                  <th className="px-4 py-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1a2135]">
                    Location
                  </th>
                  <th className="px-4 py-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1a2135]">
                    Price (NPR)
                  </th>
                  <th className="px-4 py-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1a2135]">
                    ROI
                  </th>
                  <th className="px-4 py-6 text-sm font-bold uppercase tracking-[0.18em] text-[#1a2135]">
                    Status
                  </th>
                  <th className="px-5 py-6 text-right text-sm font-bold uppercase tracking-[0.18em] text-[#1a2135] sm:px-8">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf0fb]">
                {loading && renderSkeletonRows()}

                {!loading && paginatedProperties.length === 0 && (
                  <tr className="bg-white">
                    <td
                      colSpan={7}
                      className="px-6 py-20 text-center text-lg text-[#5b6275]"
                    >
                      No properties match the current filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginatedProperties.map((property) => {
                    const status = getStatusMeta(property.status);
                    const primaryImage = getPrimaryImage(property);

                    return (
                      <tr
                        key={property.id}
                        className="group bg-white transition hover:bg-[#fbfcff]"
                      >
                        <td className="px-5 py-5 sm:px-8">
                          <div className="flex min-w-[290px] items-center gap-5">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-[#e7ebff]">
                              {primaryImage ? (
                                <img
                                  src={assetUrl(primaryImage)}
                                  alt={property.title}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#d9e2ff_0%,#eef2ff_100%)] text-xs font-semibold uppercase tracking-[0.14em] text-[#5b6275]">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-auth-headline text-[1.45rem] font-bold leading-tight text-[#131b2e]">
                                {property.title}
                              </p>
                              <p className="mt-1 text-[0.98rem] text-[#434655]">
                                ID: {getPropertyReference(property.id)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-5 text-[1rem] font-medium text-[#131b2e]">
                          {titleCase(property.category?.name ?? "Uncategorized")}
                        </td>

                        <td className="px-4 py-5 text-[1rem] font-medium text-[#394154]">
                          {property.location}
                        </td>

                        <td className="px-4 py-5 text-[1rem] font-bold text-[#0046d1]">
                          {formatCurrency(property.price)}
                        </td>

                        <td className="px-4 py-5 text-[1rem] font-bold text-[#0046d1]">
                          {formatPercent(property.roi)}
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-5 sm:px-8">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(APP_ROUTES.propertyDetail(property.id))
                              }
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#363c4d] transition hover:bg-[#edf1ff] hover:text-[#004ac6]"
                              aria-label={`View ${property.title}`}
                              title="View"
                            >
                              <Eye className="h-5 w-5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  APP_ROUTES.adminEditProperty(property.id),
                                )
                              }
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#363c4d] transition hover:bg-[#edf1ff] hover:text-[#004ac6]"
                              aria-label={`Edit ${property.title}`}
                              title="Edit"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(property.id)}
                              disabled={deletingId === property.id}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#363c4d] transition hover:bg-[#fff0f0] hover:text-[#ba1a1a] disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Delete ${property.title}`}
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-5 border-t border-[#e4e8fb] bg-[#f3f4ff] px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[1rem] text-[#2f3447]">
              Showing {showingFrom} to {showingTo} of {filteredProperties.length}{" "}
              properties
            </p>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#131b2e] transition hover:bg-[#e1e6ff] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {paginationItems.map((item, index) =>
                typeof item !== "number" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-lg text-[#434655]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`inline-flex h-12 min-w-12 items-center justify-center rounded-2xl px-4 text-[1rem] font-semibold transition ${
                      currentPage === item
                        ? "bg-[#004ac6] text-white shadow-[0_14px_30px_rgba(0,74,198,0.22)]"
                        : "text-[#131b2e] hover:bg-[#e1e6ff]"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-[1rem] font-semibold text-[#131b2e] transition hover:bg-[#e1e6ff] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
