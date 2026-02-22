"use client";

import React, { useState, useEffect } from "react";
import { baseUrl } from "@/pages/api/rest_api";

interface Category {
  id: number;
  name: string;
}

interface LocationSuggestion {
  placeId: string;
  description: string;
}

interface PropertyFormData {
  title: string;
  categoryId: number;
  location: string;
  price: string;
  roi: string;
  status: string;
  area: string;
  areaNepali?: string;
  distanceFromHighway?: number;
  images: File[];
  description: string;
}

const initialFormData: PropertyFormData = {
  title: "",
  categoryId: 0,
  location: "",
  price: "",
  roi: "",
  status: "",
  area: "",
  areaNepali: "",
  distanceFromHighway: undefined,
  images: [],
  description: "",
};

const AddProperty: React.FC = () => {
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocationPlaceId, setSelectedLocationPlaceId] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/categories/`);
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (locationQuery.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const res = await fetch(
          `${baseUrl}/api/locations/autocomplete?q=${encodeURIComponent(
            locationQuery.trim(),
          )}`,
        );
        if (!res.ok) throw new Error("Failed to fetch location suggestions");
        const payload = await res.json();
        setLocationSuggestions(Array.isArray(payload?.data) ? payload.data : []);
      } catch (error) {
        console.error("Failed to fetch location suggestions:", error);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [locationQuery]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "categoryId"
          ? Number(value)
          : name === "distanceFromHighway"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      const totalFiles = formData.images.length + selectedFiles.length;
      if (totalFiles > 10) {
        alert("You can only upload up to 10 images.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...selectedFiles],
      }));

      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleLocationQueryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextQuery = e.target.value;
    setLocationQuery(nextQuery);
    setIsLocationDropdownOpen(true);
    setSelectedLocationPlaceId("");
    setFormData((prev) => ({ ...prev, location: "" }));
  };

  const handleLocationSelect = (selected: LocationSuggestion) => {
    setSelectedLocationPlaceId(selected.placeId);
    setLocationQuery(selected.description);
    setFormData((prev) => ({ ...prev, location: selected.description }));
    setLocationSuggestions([]);
    setIsLocationDropdownOpen(false);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });

    setPreviews((prev) => {
      const updatedPreviews = [...prev];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.location.trim() || !selectedLocationPlaceId) {
      newErrors.location = "Please select location from Google suggestions";
    }
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (!formData.roi.trim()) newErrors.roi = "ROI is required";
    if (!formData.status.trim()) newErrors.status = "Status is required";
    if (!formData.area.trim()) newErrors.area = "Area is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (
      formData.distanceFromHighway !== undefined &&
      formData.distanceFromHighway < 0
    ) {
      newErrors.distanceFromHighway =
        "Distance from highway cannot be negative";
    }

    if (
      formData.areaNepali &&
      !/^\d+-\d+-\d+-\d+(\.\d+)?$/.test(formData.areaNepali)
    ) {
      newErrors.areaNepali = "Invalid format (e.g., 0-0-0-0.0)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("categoryId", String(formData.categoryId));
      form.append("location", formData.location);
      form.append("price", formData.price);
      form.append("roi", formData.roi);
      form.append("status", formData.status);
      form.append("area", formData.area);
      if (formData.areaNepali) form.append("areaNepali", formData.areaNepali);
      if (formData.distanceFromHighway !== undefined)
        form.append(
          "distanceFromHighway",
          String(formData.distanceFromHighway)
        );
      form.append("description", formData.description);

      formData.images.forEach((file) => {
        form.append("images", file);
      });

      const res = await fetch(`${baseUrl}/api/properties`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to create property");
      const data = await res.json();

      alert("Property submitted successfully!");
      console.log("Created property:", data);

      setFormData(initialFormData);
      setLocationQuery("");
      setLocationSuggestions([]);
      setSelectedLocationPlaceId("");
      setPreviews([]);
    } catch (error) {
      console.error(error);
      alert("Failed to submit property");
    }
  };

  return (
    <div className="pt-20 pb-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Add New Property
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Title */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={loadingCategories}
            >
              <option value={0}>Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationQuery}
                onChange={handleLocationQueryChange}
                onFocus={() => setIsLocationDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsLocationDropdownOpen(false), 150)}
                placeholder="Search location..."
                className="w-full border rounded px-3 py-2"
              />

              {isLocationDropdownOpen && locationQuery.trim().length >= 2 && (
                <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg max-h-64 overflow-auto">
                  {locationLoading && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Loading suggestions...
                    </div>
                  )}

                  {!locationLoading && locationSuggestions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No locations found
                    </div>
                  )}

                  {!locationLoading &&
                    locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.placeId}
                        type="button"
                        onClick={() => handleLocationSelect(suggestion)}
                        className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                          selectedLocationPlaceId === suggestion.placeId
                            ? "bg-gray-100"
                            : ""
                        }`}
                      >
                        {suggestion.description}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Price per aana
            </label>
            <input
              type="number"
              step={100000}
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price}</p>
            )}
          </div>

          {/* ROI */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              ROI (in %)
            </label>
            <input
              type="number"
              name="roi"
              value={formData.roi}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.roi && (
              <p className="text-sm text-red-500 mt-1">{errors.roi}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Status</option>
              <option value="Available">Available</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500 mt-1">{errors.status}</p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Area</label>
            <input
              step={10}
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.area && (
              <p className="text-sm text-red-500 mt-1">{errors.area}</p>
            )}
          </div>

          {/* Area Nepali */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Area (R-A-P-D)
            </label>
            <input
              type="text"
              name="areaNepali"
              value={formData.areaNepali}
              onChange={handleChange}
              placeholder="e.g. 0-0-0-0.0"
              className="w-full border rounded px-3 py-2"
            />
            {errors.areaNepali && (
              <p className="text-sm text-red-500 mt-1">{errors.areaNepali}</p>
            )}
          </div>

          {/* Distance From Highway */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Distance From Highway (m)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              name="distanceFromHighway"
              value={formData.distanceFromHighway ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            {errors.distanceFromHighway && (
              <p className="text-sm text-red-500 mt-1">
                {errors.distanceFromHighway}
              </p>
            )}
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Upload Images <span className="text-gray-500">(max 10)</span>
            </label>

            {/* Upload Box */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition
      ${
        formData.images.length >= 10
          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
          : "border-gray-400 hover:border-yellow-500 bg-gray-50 hover:bg-yellow-50"
      }`}
            >
              <input
                type="file"
                name="images"
                multiple
                id="image-upload"
                onChange={handleImageChange}
                className="hidden"
                disabled={formData.images.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer text-center ${
                  formData.images.length >= 10
                    ? "text-gray-400"
                    : "text-yellow-600 hover:text-yellow-500"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-10 w-10 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16l4-4m0 0l4 4m-4-4v12m12-16H9m0 0L9 3m0 5l12 12"
                  />
                </svg>
                <span className="font-medium">
                  {formData.images.length >= 10
                    ? "Image limit reached"
                    : "Click to upload or drag & drop"}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </label>
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {previews.map((img, i) => (
                  <div
                    key={i}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={img}
                      alt={`Preview ${i}`}
                      className="w-full h-32 object-cover group-hover:opacity-90"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
