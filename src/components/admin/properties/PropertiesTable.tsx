import React, { useEffect, useState } from "react";
import Table from "../Table"; // Adjust path as needed
import router from "next/router";
import { baseUrl } from "@/pages/api/rest_api";

interface Category {
  id: number;
  name: string;
}

interface Property {
  id: number;
  title: string;
  categoryId: number;
  category?: Category;
  location: string;
  price: string;
  roi: string;
  status: string;
  area: string;
  areaNepali?: string;
  distanceFromHighway?: number;
  images: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PropertiesApiResponse {
  data: Property[];
}

export default function PropertyTable() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchId, setSearchId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${baseUrl}/api/properties`);

      // Detect backend offline or invalid HTML response
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || contentType.includes("text/html")) {
        throw new Error("Backend is not reachable");
      }

      const payload = (await res.json()) as Property[] | PropertiesApiResponse;
      const rows = Array.isArray(payload) ? payload : (payload?.data ?? []);

      const cleaned: any = rows.map(
        ({ createdAt, updatedAt, categoryId, description, ...rest }) => ({
          ...rest,
          area: `${rest.area} sq ft`,
          distanceFromHighway:
            rest.distanceFromHighway !== undefined
              ? `${rest.distanceFromHighway}m`
              : "N/A",
          roi: `${rest.roi}%`,
          price: `Nrs. ${rest.price} per aana`,
          category: rest.category?.name ?? "N/A",
          images: `${rest.images.length} image(s)`,
        }),
      );
      setProperties(cleaned);
      setFilteredProperties(cleaned);
    } catch (err: any) {
      console.error("Failed to fetch properties:", err);
      setErrorMsg(
        "Cannot connect to backend server. Please make sure it’s running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // 🔍 handle search by ID
  const handleSearch = () => {
    if (!searchId.trim()) {
      setFilteredProperties(properties);
      return;
    }
    const id = Number(searchId);
    if (isNaN(id)) {
      alert("Please enter a valid numeric ID");
      return;
    }
    const result = properties.filter((p) => p.id === id);
    setFilteredProperties(result);
  };

  const handleRowClick = (row: Property) => console.log("Row clicked:", row);
  const handleEdit = (row: Property) =>
    router.push(`/admin/editProperty/${row.id}`);
  const handleDelete = async (row: Property) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this property?",
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(
        `${baseUrl}/api/properties/${row.id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed to delete property");
      alert("Property deleted successfully");
      router.reload();
    } catch (err) {
      console.error("Failed to delete property:", err);
      alert("Failed to delete property");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10 text-lg">
        Loading properties...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{errorMsg}</h2>
        <button
          onClick={fetchProperties}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold mb-4">Property List</h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="border border-gray-400 rounded px-3 py-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
          <button
            className="text-l font-bold text-white bg-green-500 px-4 py-2 rounded hover:cursor-pointer"
            onClick={() => router.push("/admin/addProperty")}
          >
            + Add Property
          </button>
        </div>
      </div>

      <Table<Property>
        data={filteredProperties}
        hiddenColumns={["priceNpr", "roiPercent", "areaSqft"]}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
