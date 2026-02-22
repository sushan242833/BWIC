"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { baseUrl } from "@/pages/api/rest_api";

const EditCategory = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const params = useParams();
  const id = params?.id; // e.g. /admin/categories/[id]/edit

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const res = await axios.get<{ name: string }>(`${baseUrl}/api/categories/${id}`);
      setName(res.data.name);
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
      const res = await axios.put(
        `${baseUrl}/api/categories/${id}`,
        {
          name,
        }
      );

      if (res.status === 200) {
        setSuccess("Category updated successfully!");
        setTimeout(() => {
          router.push("/admin/categories");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update category");
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
