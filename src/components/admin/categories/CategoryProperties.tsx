"use client";

import React, { useEffect, useState } from "react";
import Table from "@/components/admin/Table"; // adjust if needed
import { useRouter } from "next/router";
import { apiUrl } from "@/lib/api";

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

interface Category {
  id: number;
  name: string;
  properties: Property[];
}

export default function CategoryPropertiesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCategoryProperties();
  }, [id]);

  const fetchCategoryProperties = async () => {
    try {
      const res = await fetch(apiUrl(`/api/categories/${id}`));
      if (!res.ok) throw new Error("Failed to fetch category details");

      const data = await res.json();

      // Optionally format or clean data before setting
      const cleanedProperties = (data.properties || []).map(
        ({
          description,
          createdAt,
          updatedAt,
          categoryId,
          category,
          ...rest
        }: Property) => ({
          ...rest,
          area: `${rest.area} sq ft`,
          distanceFromHighway: `${rest.distanceFromHighway}m`,
          roi: `${rest.roi}%`,
          price: `Nrs. ${rest.price} per aana`,
          images: `${rest.images.length} image(s)`,
        })
      );

      setCategory({
        id: data.id,
        name: data.name,
        properties: cleanedProperties,
      });
    } catch (err) {
      console.error("Error fetching category properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (row: Property) =>
    console.log("Property clicked:", row);

  const handleEdit = (row: Property) =>
    router.push(`/admin/editProperty/${row.id}`);

  const handleDelete = async (row: Property) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this property?"
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(apiUrl(`/api/properties/${row.id}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete property");
      alert("Property deleted successfully");
      fetchCategoryProperties(); // refresh list
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
        <Table<Property>
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
