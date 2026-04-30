"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "@/lib/api/errors";
import { getCategories } from "@/modules/categories/api";
import { getLocationSuggestions } from "@/modules/locations/api";
import { createProperty } from "@/modules/properties/api";
import PropertyFormScreen from "@/modules/properties/components/PropertyFormScreen";
import {
  PROPERTY_FORM_MESSAGES,
  PROPERTY_FORM_TEXT,
  PROPERTY_IMAGE_MAX_FILE_SIZE_MB,
  PROPERTY_IMAGE_UPLOAD_LIMIT,
  PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
} from "@/modules/properties/constants";
import { createEmptyPropertyFormData } from "@/modules/properties/form-data";
import { validatePropertyForm } from "@/modules/properties/form-validation";
import type {
  CategoryOption,
  LocationSuggestion,
  PropertyFormData,
} from "@/modules/properties/types";

const LOCATION_AUTOCOMPLETE_DEBOUNCE_MS = 350;

const revokePreviewUrl = (value: string) => {
  if (value.startsWith("blob:")) {
    URL.revokeObjectURL(value);
  }
};

const removeFieldError = (
  currentErrors: Record<string, string>,
  key: string,
): Record<string, string> => {
  if (!currentErrors[key]) {
    return currentErrors;
  }

  const nextErrors = { ...currentErrors };
  delete nextErrors[key];
  return nextErrors;
};

const shouldFetchLocationSuggestions = (query: string): boolean =>
  query.trim().length >= 3;

const getBadgeClassName = (status: string): string => {
  if (status === "Available") {
    return "bg-[#e4f8ea] text-[#14753a]";
  }

  if (status === "Pending") {
    return "bg-[#fff3d6] text-[#9f6400]";
  }

  if (status === "Sold") {
    return "bg-[#ffe3e5] text-[#b42318]";
  }

  return "bg-[#eef0ff] text-[#4b41e1]";
};

const AddPropertyForm: React.FC = () => {
  const [formData, setFormData] = useState<PropertyFormData>(() =>
    createEmptyPropertyFormData(),
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
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
        setFormMessage({
          tone: "error",
          text: "We couldn't load categories right now.",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    if (!shouldFetchLocationSuggestions(locationQuery)) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
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

    return () => window.clearTimeout(timeout);
  }, [locationQuery]);

  useEffect(() => {
    return () => {
      previews.forEach(revokePreviewUrl);
    };
  }, [previews]);

  const updateField = (
    name: keyof PropertyFormData,
    value: string | number | File[] | undefined,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setErrors((previous) => removeFieldError(previous, String(name)));
    setFormMessage(null);
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    if (name === "categoryId") {
      updateField("categoryId", Number(value));
      return;
    }

    if (name === "distanceFromHighway") {
      updateField(
        "distanceFromHighway",
        value === "" ? undefined : Number(value),
      );
      return;
    }

    updateField(name as keyof PropertyFormData, value);
  };

  const handleDescriptionChange = (value: string) => {
    updateField("description", value);
  };

  const handleFilesAdded = (files: File[]) => {
    const totalFiles = formData.images.length + files.length;

    if (totalFiles > PROPERTY_IMAGE_UPLOAD_LIMIT) {
      setErrors((previous) => ({
        ...previous,
        images: PROPERTY_FORM_MESSAGES.imageLimitError,
      }));
      setFormMessage(null);
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > PROPERTY_IMAGE_MAX_FILE_SIZE_MB * 1024 * 1024,
    );

    if (oversizedFile) {
      setErrors((previous) => ({
        ...previous,
        images: PROPERTY_FORM_MESSAGES.imageSizeError,
      }));
      setFormMessage(null);
      return;
    }

    setFormData((previous) => ({
      ...previous,
      images: [...previous.images, ...files],
    }));
    setErrors((previous) => removeFieldError(previous, "images"));
    setFormMessage(null);

    const nextPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((previous) => [...previous, ...nextPreviews]);
  };

  const handleLocationQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextQuery = event.target.value;
    setLocationQuery(nextQuery);
    setIsLocationDropdownOpen(true);
    setSelectedLocationPlaceId("");
    setFormData((previous) => ({ ...previous, location: "" }));
    setErrors((previous) => removeFieldError(previous, "location"));
    setFormMessage(null);
  };

  const handleLocationSelect = (selected: LocationSuggestion) => {
    setSelectedLocationPlaceId(selected.placeId);
    setLocationQuery(selected.description);
    setFormData((previous) => ({ ...previous, location: selected.description }));
    setLocationSuggestions([]);
    window.setTimeout(
      () => setIsLocationDropdownOpen(false),
      PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
    );
    setErrors((previous) => removeFieldError(previous, "location"));
    setFormMessage(null);
  };

  const removeImage = (index: number) => {
    setFormData((previous) => {
      const updatedImages = [...previous.images];
      updatedImages.splice(index, 1);
      return { ...previous, images: updatedImages };
    });

    setPreviews((previous) => {
      const updatedPreviews = [...previous];
      const imageToRevoke = updatedPreviews[index];
      if (imageToRevoke) {
        revokePreviewUrl(imageToRevoke);
      }
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  const resetForm = () => {
    previews.forEach(revokePreviewUrl);
    setFormData(createEmptyPropertyFormData());
    setPreviews([]);
    setErrors({});
    setFormMessage(null);
    setLocationQuery("");
    setLocationSuggestions([]);
    setSelectedLocationPlaceId("");
    setIsLocationDropdownOpen(false);
  };

  const validate = () => {
    const nextErrors = validatePropertyForm(formData, {
      hasSelectedLocation: Boolean(selectedLocationPlaceId),
    });

    setErrors(nextErrors);
    setFormMessage(
      Object.keys(nextErrors).length > 0
        ? {
            tone: "error",
            text: "Please correct the highlighted fields and try again.",
          }
        : null,
    );
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setFormMessage(null);

    try {
      await createProperty(formData);
      resetForm();
      setFormMessage({
        tone: "success",
        text: PROPERTY_FORM_MESSAGES.addSuccess,
      });
    } catch (error) {
      console.error(error);
      setErrors((previous) => ({
        ...previous,
        ...getApiFieldErrors(error),
      }));
      setFormMessage({
        tone: "error",
        text: getApiErrorMessage(error, PROPERTY_FORM_MESSAGES.addError),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const previewImages = useMemo(
    () =>
      previews.map((src, index) => ({
        id: `new-${index}`,
        src,
        alt: `Property preview ${index + 1}`,
        isPrimary: index === 0,
        onRemove: () => removeImage(index),
      })),
    [previews],
  );

  const badgeLabel = formData.status || "New Listing";

  return (
    <PropertyFormScreen
      mode="create"
      formData={formData}
      errors={errors}
      formMessage={formMessage}
      categories={categories}
      loadingCategories={loadingCategories}
      locationQuery={locationQuery}
      locationSuggestions={locationSuggestions}
      locationLoading={locationLoading}
      isLocationDropdownOpen={
        isLocationDropdownOpen && shouldFetchLocationSuggestions(locationQuery)
      }
      selectedLocationPlaceId={selectedLocationPlaceId}
      previewImages={previewImages}
      submitting={submitting}
      pageTitle={PROPERTY_FORM_TEXT.addTitle}
      headerTitle="New Property Draft"
      headerMeta="Build a polished listing with pricing, land dimensions, media, and a strong investment narrative."
      badgeLabel={badgeLabel}
      badgeClassName={getBadgeClassName(formData.status)}
      submitLabel={PROPERTY_FORM_TEXT.addSubmit}
      submittingLabel={PROPERTY_FORM_TEXT.creatingSubmit}
      resetLabel="Reset Draft"
      onSubmit={handleSubmit}
      onFieldChange={handleChange}
      onDescriptionChange={handleDescriptionChange}
      onLocationQueryChange={handleLocationQueryChange}
      onLocationSelect={handleLocationSelect}
      onLocationDropdownOpenChange={setIsLocationDropdownOpen}
      onFilesAdded={handleFilesAdded}
      onReset={resetForm}
    />
  );
};

export default AddPropertyForm;
