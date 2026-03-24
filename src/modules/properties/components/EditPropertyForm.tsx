"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { APP_ROUTES } from "@/config/routes";
import { assetUrl } from "@/lib/api/client";
import { getCategories } from "@/modules/categories/api";
import {
  getLocationSuggestions,
  LOCATION_AUTOCOMPLETE_DEBOUNCE_MS,
  shouldFetchLocationSuggestions,
} from "@/modules/locations/api";
import { getProperty, updateProperty } from "@/modules/properties/api";
import {
  PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE,
  PROPERTY_FORM_MESSAGES,
  PROPERTY_FORM_TEXT,
  PROPERTY_IMAGE_UPLOAD_LIMIT,
  PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
  PROPERTY_LOCATION_EXISTING_PLACE_ID,
  PROPERTY_STATUS_OPTIONS,
} from "@/modules/properties/constants";
import { createEmptyPropertyFormData } from "@/modules/properties/form-data";
import { validatePropertyForm } from "@/modules/properties/form-validation";
import type {
  CategoryOption,
  LocationSuggestion,
  PropertyFormData,
} from "@/modules/properties/types";

const EditPropertyForm: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<PropertyFormData>(() =>
    createEmptyPropertyFormData(),
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocationPlaceId, setSelectedLocationPlaceId] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchData = async () => {
      try {
        const [categoryData, property] = await Promise.all([
          getCategories(),
          getProperty(String(id)),
        ]);

        const existingImages = property.images || [];
        const existingPreviewUrls = existingImages.map((imagePath: string) =>
          assetUrl(imagePath),
        );

        setCategories(categoryData as CategoryOption[]);
        setFormData({
          ...createEmptyPropertyFormData(),
          ...property,
          images: [],
          existingImages,
        });
        setLocationQuery(property.location || "");
        setSelectedLocationPlaceId(PROPERTY_LOCATION_EXISTING_PLACE_ID);
        setPreviews(existingPreviewUrls);
      } catch (error) {
        console.error("Error loading property:", error);
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [previews]);

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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const selectedFiles = Array.from(event.target.files);
    const totalFiles =
      (formData.existingImages?.length || 0) +
      formData.images.length +
      selectedFiles.length;

    if (totalFiles > PROPERTY_IMAGE_UPLOAD_LIMIT) {
      alert(PROPERTY_FORM_MESSAGES.imageLimitError);
      return;
    }

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedFiles],
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number, isExisting = false) => {
    setFormData((prev) => {
      if (isExisting) {
        const updatedExistingImages = [...(prev.existingImages || [])];
        updatedExistingImages.splice(index, 1);
        return { ...prev, existingImages: updatedExistingImages };
      }

      const updatedImages = [...prev.images];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });

    setPreviews((prev) => {
      const updatedPreviews = [...prev];
      const existingCount = formData.existingImages?.length || 0;
      const previewIndex = isExisting ? index : existingCount + index;
      const previewToRevoke = updatedPreviews[previewIndex];
      if (previewToRevoke?.startsWith("blob:")) {
        URL.revokeObjectURL(previewToRevoke);
      }
      updatedPreviews.splice(previewIndex, 1);
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

    setSubmitting(true);

    try {
      await updateProperty(String(id), formData);

      alert(PROPERTY_FORM_MESSAGES.editSuccess);
      router.push(APP_ROUTES.adminProperties);
    } catch (error) {
      console.error(error);
      alert(PROPERTY_FORM_MESSAGES.editError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">{PROPERTY_FORM_TEXT.loading}</div>;
  }

  return (
    <div className="pt-20 pb-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {PROPERTY_FORM_TEXT.editTitle}
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
              step={100000}
              type="number"
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
              {PROPERTY_FORM_TEXT.imagesLabel}
            </label>

            {previews.length > 0 && (
              <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {previews.map((src, index) => {
                  const existingCount = formData.existingImages?.length || 0;
                  const isExisting = index < existingCount;
                  const sourceIndex = isExisting
                    ? index
                    : index - existingCount;

                  return (
                    <div
                      key={`preview-${index}`}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(sourceIndex, isExisting)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        x
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition ${
                formData.images.length +
                  (formData.existingImages?.length || 0) >=
                PROPERTY_IMAGE_UPLOAD_LIMIT
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
                disabled={
                  formData.images.length +
                    (formData.existingImages?.length || 0) >=
                  PROPERTY_IMAGE_UPLOAD_LIMIT
                }
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer text-yellow-600 hover:text-yellow-500 text-center"
              >
                {PROPERTY_FORM_TEXT.imageUploadPrompt}
              </label>
            </div>
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
              disabled={submitting}
              className={`${
                submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-medium py-2 px-6 rounded transition`}
            >
              {submitting
                ? PROPERTY_FORM_TEXT.updatingSubmit
                : PROPERTY_FORM_TEXT.editSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyForm;
