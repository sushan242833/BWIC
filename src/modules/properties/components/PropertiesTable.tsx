import React, { useEffect, useState } from "react";
import router from "next/router";
import Table from "@/components/admin/Table";
import { deleteProperty, getProperties } from "@/modules/properties/api";
import {
  formatPropertyTableRows,
  PropertyTableRow,
} from "@/modules/properties/table-rows";
import type { PropertySummary } from "@/modules/properties/types";

export default function PropertiesTable() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyTableRow[]>([]);
  const [searchId, setSearchId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const payload = await getProperties();
      const rows = payload.data ?? [];
      const cleaned = formatPropertyTableRows(rows);

      setProperties(rows);
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
      setFilteredProperties(formatPropertyTableRows(properties));
      return;
    }
    const id = Number(searchId);
    if (isNaN(id)) {
      alert("Please enter a valid numeric ID");
      return;
    }
    const result = properties.filter((p) => p.id === id);
    setFilteredProperties(formatPropertyTableRows(result));
  };

  const handleRowClick = (row: PropertyTableRow) =>
    console.log("Row clicked:", row);
  const handleEdit = (row: PropertyTableRow) =>
    router.push(`/admin/editProperty/${row.id}`);
  const handleDelete = async (row: PropertyTableRow) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this property?",
    );
    if (!confirmDelete) return;
    try {
      await deleteProperty(row.id);
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

      <Table<PropertyTableRow>
        data={filteredProperties}
        hiddenColumns={[]}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
