"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { APP_ROUTES } from "@/config/routes";
import { getCategory, updateCategory } from "@/modules/categories/api";

const EditCategory = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const category = await getCategory(String(id));
      setName(category.name);
    } catch (err: any) {
      setError("Failed to load category data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateCategory(String(id), name);

      setSuccess("Category updated successfully!");
      setTimeout(() => {
        router.push(APP_ROUTES.adminCategories);
      }, 1000);
    } catch (err: any) {
      setError(
        err instanceof Error ? err.message : "Failed to update category",
      );
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading category data...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-30 mb-10 bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Category</h2>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Category Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category name"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
        >
          Update Category
        </button>
      </form>
    </div>
  );
};

export default EditCategory;
