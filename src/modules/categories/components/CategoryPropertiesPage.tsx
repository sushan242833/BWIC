"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Table from "@/components/admin/Table";
import { getCategory } from "@/modules/categories/api";
import { deleteProperty, getProperties } from "@/modules/properties/api";
import {
  formatPropertyTableRows,
  PropertyTableRow,
} from "@/modules/properties/table-rows";
import type { CategoryDetail } from "@/modules/categories/types";

interface CategoryState extends CategoryDetail {
  properties: PropertyTableRow[];
}

export default function CategoryPropertiesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [category, setCategory] = useState<CategoryState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCategoryProperties();
  }, [id]);

  const fetchCategoryProperties = async () => {
    try {
      const [data, propertiesPayload] = await Promise.all([
        getCategory(String(id)),
        getProperties({ categoryId: String(id) }),
      ]);

      const cleanedProperties = formatPropertyTableRows(propertiesPayload.data ?? []);

      setCategory({
        ...data,
        properties: cleanedProperties,
      });
    } catch (err) {
      console.error("Error fetching category properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (row: PropertyTableRow) =>
    console.log("Property clicked:", row);

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
      fetchCategoryProperties();
    } catch (err) {
      console.error("Failed to delete property:", err);
      alert("Failed to delete property");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  if (!category)
    return (
      <p className="text-center mt-10 text-gray-600">Category not found.</p>
    );

  return (
    <div className="p-6 pt-15">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold mb-4 capitalize">
          Category: {category.name}
        </h2>
        <button
          className="text-l font-bold text-white bg-gray-500 px-4 py-2 rounded hover:cursor-pointer"
          onClick={() => router.back()}
        >
          ← Back
        </button>
      </div>

      {category.properties.length > 0 ? (
        <Table<PropertyTableRow>
          data={category.properties}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <p className="text-gray-600 italic text-center">
          No properties available for this category.
        </p>
      )}
    </div>
  );
}
