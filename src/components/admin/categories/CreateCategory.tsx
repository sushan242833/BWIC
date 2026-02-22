import { useState, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import router from "next/router";
import { baseUrl } from "@/pages/api/rest_api";

const CreateCategoryForm = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${baseUrl}/api/categories/`, {
        name,
      });

      if (res.status === 201) {
        setSuccess("Category created successfully!");
        setTimeout(() => {
          router.push("/admin/categories");
        }, 1000);
        setName("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-30 mb-10 bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Add New Category</h2>

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
          Add Category
        </button>
      </form>
    </div>
  );
};

export default CreateCategoryForm;
