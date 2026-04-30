"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { APP_ROUTES } from "@/config/routes";
import { assetUrl } from "@/lib/api/client";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "@/lib/api/errors";
import { getCategories } from "@/modules/categories/api";
import { getLocationSuggestions } from "@/modules/locations/api";
import { getProperty, updateProperty } from "@/modules/properties/api";
import PropertyFormScreen from "@/modules/properties/components/PropertyFormScreen";
import {
  PROPERTY_FORM_MESSAGES,
  PROPERTY_FORM_TEXT,
  PROPERTY_IMAGE_MAX_FILE_SIZE_MB,
  PROPERTY_IMAGE_UPLOAD_LIMIT,
  PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
  PROPERTY_LOCATION_EXISTING_PLACE_ID,
} from "@/modules/properties/constants";
import {
  createEmptyPropertyFormData,
  createPropertyFormDataFromDetail,
} from "@/modules/properties/form-data";
import { formatPropertyReference } from "@/modules/properties/reference";
import { validatePropertyForm } from "@/modules/properties/form-validation";
import type {
  CategoryOption,
  LocationSuggestion,
  PropertyDetail,
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

const formatLastUpdated = (value?: string): string => {
  if (!value) {
    return "Ready for refinement";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

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

const EditPropertyForm: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<PropertyFormData>(() =>
    createEmptyPropertyFormData(),
  );
  const [initialFormData, setInitialFormData] =
    useState<PropertyFormData | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadError, setLoadError] = useState("");
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
  const [propertyMeta, setPropertyMeta] = useState<PropertyDetail | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const [categoryData, property] = await Promise.all([
          getCategories(),
          getProperty(String(id)),
        ]);

        if (!isMounted) {
          return;
        }

        const existingImages = property.images || [];
        const existingPreviewUrls = existingImages.map((imagePath: string) =>
          assetUrl(imagePath),
        );

        const hydratedFormData = createPropertyFormDataFromDetail({
          ...property,
          images: existingImages,
        });

        setCategories(categoryData as CategoryOption[]);
        setFormData(hydratedFormData);
        setInitialFormData(hydratedFormData);
        setPreviews(existingPreviewUrls);
        setLocationQuery(property.location || "");
        setSelectedLocationPlaceId(PROPERTY_LOCATION_EXISTING_PLACE_ID);
        setPropertyMeta(property);
        setFormMessage(null);
      } catch (error) {
        console.error("Error loading property:", error);
        if (isMounted) {
          setLoadError("We couldn't load this property right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingCategories(false);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      previews.forEach(revokePreviewUrl);
    };
  }, [previews]);

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

  const updateField = (
    name: keyof PropertyFormData,
    value: string | number | File[] | string[] | undefined,
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
    setFormData((previous) => ({
      ...previous,
      location: selected.description,
    }));
    setLocationSuggestions([]);
    window.setTimeout(
      () => setIsLocationDropdownOpen(false),
      PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS,
    );
    setErrors((previous) => removeFieldError(previous, "location"));
    setFormMessage(null);
  };

  const handleFilesAdded = (files: File[]) => {
    const totalFiles =
      (formData.existingImages?.length || 0) +
      formData.images.length +
      files.length;

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

    const nextPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((previous) => ({
      ...previous,
      images: [...previous.images, ...files],
    }));
    setPreviews((previous) => [...previous, ...nextPreviews]);
    setErrors((previous) => removeFieldError(previous, "images"));
    setFormMessage(null);
  };

  const removeImage = (index: number, isExisting = false) => {
    setFormData((previous) => {
      if (isExisting) {
        const updatedExistingImages = [...(previous.existingImages || [])];
        updatedExistingImages.splice(index, 1);
        return { ...previous, existingImages: updatedExistingImages };
      }

      const updatedImages = [...previous.images];
      updatedImages.splice(index, 1);
      return { ...previous, images: updatedImages };
    });

    setPreviews((previous) => {
      const updatedPreviews = [...previous];
      const existingCount = formData.existingImages?.length || 0;
      const previewIndex = isExisting ? index : existingCount + index;
      const previewToRevoke = updatedPreviews[previewIndex];
      if (previewToRevoke) {
        revokePreviewUrl(previewToRevoke);
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
      await updateProperty(String(id), formData);
      setFormMessage({
        tone: "success",
        text: PROPERTY_FORM_MESSAGES.editSuccess,
      });
      await router.push(APP_ROUTES.adminProperties);
    } catch (error) {
      console.error(error);
      setErrors((previous) => ({
        ...previous,
        ...getApiFieldErrors(error),
      }));
      setFormMessage({
        tone: "error",
        text: getApiErrorMessage(error, PROPERTY_FORM_MESSAGES.editError),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const previewImages = useMemo(() => {
    const existingCount = formData.existingImages?.length || 0;

    return previews.map((src, index) => {
      const isExisting = index < existingCount;
      const sourceIndex = isExisting ? index : index - existingCount;

      return {
        id: `${isExisting ? "existing" : "new"}-${index}`,
        src,
        alt: `Property preview ${index + 1}`,
        isPrimary: index === 0,
        onRemove: () => removeImage(sourceIndex, isExisting),
      };
    });
  }, [formData.existingImages, previews]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-6.25rem)] items-center justify-center px-6">
        <div className="rounded-[2rem] border border-[#e8ebf8] bg-white px-8 py-8 text-center shadow-[0_24px_70px_rgba(19,27,46,0.06)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#004ac6] border-t-transparent" />
          <p className="mt-5 text-base font-medium text-[#4e5a73]">
            {PROPERTY_FORM_TEXT.loading}
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !initialFormData) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#ffd9d6] bg-white px-8 py-10 shadow-[0_24px_70px_rgba(19,27,46,0.06)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#ba1a1a]">
            Property Load Error
          </p>
          <h2 className="mt-4 font-auth-headline text-3xl font-bold text-[#131b2e]">
            Unable to open this property
          </h2>
          <p className="mt-3 text-base text-[#5f6b84]">{loadError}</p>
          <button
            type="button"
            onClick={() => void router.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#004ac6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003da4]"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const reference = id ? formatPropertyReference(String(id)) : "Draft";

  return (
    <PropertyFormScreen
      mode="edit"
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
      pageTitle={PROPERTY_FORM_TEXT.editTitle}
      headerTitle={formData.title || "Property Draft"}
      headerMeta={`ID: ${reference} • Last updated ${formatLastUpdated(propertyMeta?.updatedAt)}`}
      badgeLabel={formData.status || "Draft"}
      badgeClassName={getBadgeClassName(formData.status)}
      submitLabel={PROPERTY_FORM_TEXT.editSubmit}
      submittingLabel={PROPERTY_FORM_TEXT.updatingSubmit}
      onSubmit={handleSubmit}
      onFieldChange={handleChange}
      onDescriptionChange={handleDescriptionChange}
      onLocationQueryChange={handleLocationQueryChange}
      onLocationSelect={handleLocationSelect}
      onLocationDropdownOpenChange={setIsLocationDropdownOpen}
      onFilesAdded={handleFilesAdded}
    />
  );
};

export default EditPropertyForm;
