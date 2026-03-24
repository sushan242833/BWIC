import React, { useEffect, useState } from "react";
import router from "next/router";
import Table from "@/components/admin/Table";
import { APP_ROUTES } from "@/config/routes";
import { deleteCategory, getCategories } from "@/modules/categories/api";
import type { CategorySummary } from "@/modules/categories/types";

interface CategoryRow {
  id: number;
  name: string;
  propertyCount: string;
}

export default function CategoriesTable() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    getCategories()
      .then((data: CategorySummary[]) => {
        const sorted = [...(Array.isArray(data) ? data : [])].sort(
          (a, b) => a.id - b.id,
        );
        const cleaned = sorted.map(
          ({ ...rest }): CategoryRow => ({
            ...rest,
            propertyCount: `${rest.propertyCount}`,
          }),
        );

        setCategories(cleaned);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const handleRowClick = (row: CategoryRow) => {
    router.push(APP_ROUTES.adminCategoryDetail(row.id));
  };
  const handleEdit = (row: CategoryRow) =>
    router.push(APP_ROUTES.adminEditCategory(row.id));
  const handleDelete = async (row: CategoryRow) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this category?",
    );
    if (!confirmDelete) return;
    try {
      await deleteCategory(row.id);
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
          onClick={() => router.push(APP_ROUTES.adminCreateCategory)}
        >
          + Add Category
        </button>
      </div>
      <Table<CategoryRow>
        data={categories}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
