import React, { useEffect, useState } from "react";
import Table from "../Table"; // Adjust path as needed
import router from "next/router";
import { baseUrl } from "@/pages/api/rest_api";

interface Category {
  id: number;
  name: string;
  properties: any[]; // Assuming properties is an array
}

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${baseUrl}/api/categories`)
      .then((res) => res.json())
      .then((data: Category[]) => {
        // Sort categories by ID (ascending)
        const sorted = data.sort((a, b) => a.id - b.id);

        // Transform data as before
        const cleaned: any = sorted.map(({ ...rest }) => ({
          ...rest,
          properties: `${rest.properties.length}`,
        }));

        setCategories(cleaned);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const handleRowClick = (row: Category) => {
    router.push(`/admin/categories/${row.id}`);
  };
  const handleEdit = (row: Category) =>
    router.push(`/admin/editCategory/${row.id}`);
  const handleDelete = async (row: Category) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;
    try {
      const res = await fetch(
        `${baseUrl}/api/categories/${row.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete category");
      }
      alert("Category deleted successfully");
      router.reload();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="p-6 pt-15">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold mb-4">Category List</h2>
        <button
          className="text-l font-bold text-white bg-green-500 px-4 py-2 rounded hover:cursor-pointer"
          onClick={() => router.push("/admin/createCategory")}
        >
          + Add Category
        </button>
      </div>
      <Table<Category>
        data={categories}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
