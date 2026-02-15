import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { baseUrl, getProperties } from "@/pages/api/rest_api";
import { capitalize } from "@/utils/Capitalize";
import { contactInfo } from "@/utils/ContactInformation";

interface Category {
  id: number;
  name: string;
}

interface Property {
  id: number;
  title: string;
  categoryId: number;
  location: string;
  price: string;
  priceNpr?: number;
  roi: string;
  roiPercent?: number;
  status: string;
  area: string;
  areaSqft?: number;
  areaNepali?: string;
  distanceFromHighway?: number;
  images: string[];
  description: string;
  category: {
    id?: number;
    name: string;
  };
}

interface PropertiesResponse {
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface FilterState {
  location: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  minRoi: string;
  minArea: string;
  maxDistanceFromHighway: string;
  status: string;
}

const defaultFilters: FilterState = {
  location: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  minRoi: "",
  minArea: "",
  maxDistanceFromHighway: "",
  status: "",
};

const defaultPagination = {
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

const Properties = () => {
  const router = useRouter();
  const propertyListRef = useRef<HTMLDivElement>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "roi_desc" | "newest">(
    "newest"
  );
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");
        const response = (await getProperties({
          ...appliedFilters,
          sort,
          page: pagination.page,
          limit: pagination.limit,
        })) as PropertiesResponse;

        setProperties(Array.isArray(response?.data) ? response.data : []);
        setPagination(
          response?.pagination
            ? response.pagination
            : { ...defaultPagination, page: pagination.page, limit: pagination.limit }
        );
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError("Failed to load properties.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [appliedFilters, sort, pagination.page, pagination.limit]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setAppliedFilters(filters);
    propertyListRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSort("newest");
    setPagination((prev) => ({ ...prev, page: 1 }));
    propertyListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLimit = Number(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1, limit: nextLimit }));
  };

  const handleScrollToProperties = () => {
    propertyListRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "text-green-600";
      case "sold":
        return "text-red-600";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-slate-600";
    }
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(appliedFilters).filter((value) => value !== "").length;
  }, [appliedFilters]);

  return (
    <section className="bg-slate-800 py-16 px-4">
      <div className="text-center mb-10 max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight">
          Discover Profitable{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Investment Properties
          </span>{" "}
          in Nepal
        </h2>
        <p className="text-slate-400 text-lg">
          Use real filters for location, price, ROI, area, and highway distance.
        </p>
      </div>

      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => setShowMobileFilters((prev) => !prev)}
          className="md:hidden w-full bg-slate-700 text-white px-4 py-3 rounded-lg mb-4"
        >
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <div
          className={`bg-slate-900/80 border border-slate-700 rounded-xl p-4 md:p-6 ${
            showMobileFilters ? "block" : "hidden md:block"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <input
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            />

            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {capitalize(category.name)}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="minPrice"
              placeholder="Min Price (NPR)"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            />

            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price (NPR)"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            />

            <input
              type="number"
              step="0.01"
              name="minRoi"
              placeholder="Min ROI (%)"
              value={filters.minRoi}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            />

            <input
              type="number"
              name="minArea"
              placeholder="Min Area (sq ft)"
              value={filters.minArea}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            />

            <input
              type="number"
              name="maxDistanceFromHighway"
              placeholder="Max Distance (m)"
              value={filters.maxDistanceFromHighway}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            />

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value as "price_asc" | "price_desc" | "roi_desc" | "newest"
                  )
                }
                className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="roi_desc">ROI: High to Low</option>
              </select>

              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-600"
              >
                <option value={6}>6 / page</option>
                <option value={9}>9 / page</option>
                <option value={12}>12 / page</option>
                <option value={18}>18 / page</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="border border-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-slate-300">
          Active filters: {activeFilterCount} | Total results: {pagination.total}
        </div>
      </div>

      <div
        ref={propertyListRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
      >
        {loading && (
          <div className="text-white col-span-full text-center py-10">Loading properties...</div>
        )}

        {!loading && error && (
          <div className="text-red-400 col-span-full text-center py-10">{error}</div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="text-slate-300 col-span-full text-center py-10">
            No properties found for selected filters.
          </div>
        )}

        {!loading &&
          !error &&
          properties.map((property) => (
            <div
              key={property.id}
              onClick={() => router.push(`/properties/${property.id}`)}
              className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col"
            >
              {property.images?.length > 0 && (
                <img
                  src={`${baseUrl}/${property.images[0]}`}
                  alt={property.title}
                  className="w-full h-52 object-cover rounded-xl mb-4"
                />
              )}
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {property.title}
              </h3>
              <p className="text-sm text-slate-500 mb-2">{property.location}</p>
              <p className="text-slate-600 text-sm mb-4 truncate">
                {property.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 mt-auto">
                <div>
                  <p className="font-medium">NRs. {property.price}</p>
                  <p className="text-xs text-slate-500">Price (per aana)</p>
                </div>
                <div>
                  <p className="font-medium">{property.roi}%</p>
                  <p className="text-xs text-slate-500">Expected ROI</p>
                </div>
                <div>
                  <p className="font-medium">{property.area}</p>
                  <p className="text-xs text-slate-500">Area (sq ft)</p>
                </div>
                {property.areaNepali && (
                  <div>
                    <p className="font-medium">{property.areaNepali}</p>
                    <p className="text-xs text-slate-500">Area (R-A-P-D)</p>
                  </div>
                )}
                {property.distanceFromHighway !== undefined && (
                  <div>
                    <p className="font-medium">{property.distanceFromHighway}m</p>
                    <p className="text-xs text-slate-500">From Highway</p>
                  </div>
                )}
                <div>
                  <p className={`font-medium ${getStatusColor(property.status)}`}>
                    {capitalize(property.status)}
                  </p>
                  <p className="text-xs text-slate-500">Status</p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="max-w-7xl mx-auto mt-10 flex items-center justify-center gap-4">
        <button
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
          }
          disabled={!pagination.hasPrev}
          className="px-4 py-2 rounded-md border border-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <p className="text-slate-300">
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <button
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          disabled={!pagination.hasNext}
          className="px-4 py-2 rounded-md border border-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <div className="mt-20 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Ready to Invest?</h3>
        <p className="text-slate-400 max-w-xl mx-auto mb-6">
          Schedule a call with our experts or view all available listings to get
          started.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
            <a href={`tel: ${contactInfo.phone}`}>Make a Call</a>
          </button>
          <button
            onClick={handleScrollToProperties}
            className="border border-slate-300 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition cursor-pointer"
          >
            View Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default Properties;
