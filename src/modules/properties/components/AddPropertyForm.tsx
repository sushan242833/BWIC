"use client";

import React, { useEffect, useState } from "react";
import { getCategories } from "@/modules/categories/api";
import {
  createProperty,
} from "@/modules/properties/api";
import {
  PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE,
  PROPERTY_FORM_MESSAGES,
  PROPERTY_FORM_TEXT,
  PROPERTY_IMAGE_UPLOAD_LIMIT,
  PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
  PROPERTY_STATUS_OPTIONS,
} from "@/modules/properties/constants";
import { createEmptyPropertyFormData } from "@/modules/properties/form-data";
import { validatePropertyForm } from "@/modules/properties/form-validation";
import {
  getLocationSuggestions,
  LOCATION_AUTOCOMPLETE_DEBOUNCE_MS,
  shouldFetchLocationSuggestions,
} from "@/modules/locations/api";
import type {
  CategoryOption,
  LocationSuggestion,
  PropertyFormData,
} from "@/modules/properties/types";

const AddPropertyForm: React.FC = () => {
  const [formData, setFormData] = useState<PropertyFormData>(() =>
    createEmptyPropertyFormData(),
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
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
        const data = await getCategories();
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
    if (!shouldFetchLocationSuggestions(locationQuery)) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLocationLoading(true);
        const suggestions = await getLocationSuggestions(locationQuery);
        setLocationSuggestions(Array.isArray(suggestions) ? suggestions : []);
      } catch (error) {
        console.error("Failed to fetch location suggestions:", error);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, LOCATION_AUTOCOMPLETE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [locationQuery]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const selectedFiles = Array.from(event.target.files);
    const totalFiles = formData.images.length + selectedFiles.length;

    if (totalFiles > PROPERTY_IMAGE_UPLOAD_LIMIT) {
      alert(PROPERTY_FORM_MESSAGES.imageLimitError);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedFiles],
    }));

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleLocationQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextQuery = event.target.value;
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
      const imageToRevoke = updatedPreviews[index];
      if (imageToRevoke?.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRevoke);
      }
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  const validate = () => {
    const nextErrors = validatePropertyForm(formData, {
      hasSelectedLocation: Boolean(selectedLocationPlaceId),
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      const data = await createProperty(formData);

      alert(PROPERTY_FORM_MESSAGES.addSuccess);
      console.log("Created property:", data);

      setFormData(createEmptyPropertyFormData());
      setLocationQuery("");
      setLocationSuggestions([]);
      setSelectedLocationPlaceId("");
      setPreviews((prev) => {
        prev.forEach((preview) => {
          if (preview.startsWith("blob:")) {
            URL.revokeObjectURL(preview);
          }
        });
        return [];
      });
    } catch (error) {
      console.error(error);
      alert(PROPERTY_FORM_MESSAGES.addError);
    }
  };

  return (
    <div className="pt-20 pb-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {PROPERTY_FORM_TEXT.addTitle}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.titleLabel}
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

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.categoryLabel}
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={loadingCategories}
            >
              <option value={PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE}>
                {PROPERTY_FORM_TEXT.categoryPlaceholder}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.locationLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationQuery}
                onChange={handleLocationQueryChange}
                onFocus={() => setIsLocationDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(
                    () => setIsLocationDropdownOpen(false),
                    PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
                  )
                }
                placeholder={PROPERTY_FORM_TEXT.locationPlaceholder}
                className="w-full border rounded px-3 py-2"
              />

              {isLocationDropdownOpen &&
                shouldFetchLocationSuggestions(locationQuery) && (
                  <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg max-h-64 overflow-auto">
                    {locationLoading && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {PROPERTY_FORM_TEXT.loadingLocations}
                      </div>
                    )}

                    {!locationLoading && locationSuggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {PROPERTY_FORM_TEXT.noLocations}
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

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.priceLabel}
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

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.roiLabel}
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

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.statusLabel}
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">{PROPERTY_FORM_TEXT.statusPlaceholder}</option>
              {PROPERTY_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-sm text-red-500 mt-1">{errors.status}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.areaLabel}
            </label>
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

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.areaNepaliLabel}
            </label>
            <input
              type="text"
              name="areaNepali"
              value={formData.areaNepali}
              onChange={handleChange}
              placeholder={PROPERTY_FORM_TEXT.areaNepaliPlaceholder}
              className="w-full border rounded px-3 py-2"
            />
            {errors.areaNepali && (
              <p className="text-sm text-red-500 mt-1">{errors.areaNepali}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.distanceLabel}
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

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {PROPERTY_FORM_TEXT.imagesLabel}{" "}
              <span className="text-gray-500">
                {PROPERTY_FORM_TEXT.imagesLimitLabel}
              </span>
            </label>

            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition ${
                formData.images.length >= PROPERTY_IMAGE_UPLOAD_LIMIT
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
                disabled={formData.images.length >= PROPERTY_IMAGE_UPLOAD_LIMIT}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer text-center ${
                  formData.images.length >= PROPERTY_IMAGE_UPLOAD_LIMIT
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
                  {formData.images.length >= PROPERTY_IMAGE_UPLOAD_LIMIT
                    ? PROPERTY_FORM_TEXT.imageLimitReached
                    : PROPERTY_FORM_TEXT.imageUploadPrompt}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {PROPERTY_FORM_TEXT.imageUploadHelpText}
                </p>
              </label>
            </div>

            {previews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {previews.map((image, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={image}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover group-hover:opacity-90"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove image"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700 mb-1">
              {PROPERTY_FORM_TEXT.descriptionLabel}
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

          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition"
            >
              {PROPERTY_FORM_TEXT.addSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyForm;
