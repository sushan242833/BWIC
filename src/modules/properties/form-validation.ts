import {
  PROPERTY_AREA_NEPALI_PATTERN,
  PROPERTY_FORM_MESSAGES,
} from "@/modules/properties/constants";
import type { PropertyFormData } from "@/modules/properties/types";

interface ValidatePropertyFormOptions {
  hasSelectedLocation: boolean;
}

const getTrimmedValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).trim();
  }

  return "";
};

const parseNumberValue = (value: unknown): number | null => {
  const normalized = getTrimmedValue(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const validatePropertyForm = (
  formData: PropertyFormData,
  options: ValidatePropertyFormOptions,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!getTrimmedValue(formData.title)) {
    errors.title = PROPERTY_FORM_MESSAGES.titleRequired;
  }

  if (!formData.categoryId) {
    errors.categoryId = PROPERTY_FORM_MESSAGES.categoryRequired;
  }

  if (!getTrimmedValue(formData.location) || !options.hasSelectedLocation) {
    errors.location = PROPERTY_FORM_MESSAGES.locationRequired;
  }

  if (!getTrimmedValue(formData.price)) {
    errors.price = PROPERTY_FORM_MESSAGES.priceRequired;
  } else {
    const price = parseNumberValue(formData.price);

    if (price === null || Number.isNaN(price)) {
      errors.price = PROPERTY_FORM_MESSAGES.priceInvalid;
    } else if (price <= 0) {
      errors.price = PROPERTY_FORM_MESSAGES.pricePositive;
    }
  }

  if (!getTrimmedValue(formData.roi)) {
    errors.roi = PROPERTY_FORM_MESSAGES.roiRequired;
  } else {
    const roi = parseNumberValue(formData.roi);

    if (roi === null || Number.isNaN(roi)) {
      errors.roi = PROPERTY_FORM_MESSAGES.roiInvalid;
    } else if (roi < 0) {
      errors.roi = PROPERTY_FORM_MESSAGES.roiNegative;
    }
  }

  if (!getTrimmedValue(formData.status)) {
    errors.status = PROPERTY_FORM_MESSAGES.statusRequired;
  }

  if (!getTrimmedValue(formData.area)) {
    errors.area = PROPERTY_FORM_MESSAGES.areaRequired;
  } else {
    const area = parseNumberValue(formData.area);

    if (area === null || Number.isNaN(area)) {
      errors.area = PROPERTY_FORM_MESSAGES.areaInvalid;
    } else if (area <= 0) {
      errors.area = PROPERTY_FORM_MESSAGES.areaPositive;
    }
  }

  if (!getTrimmedValue(formData.description)) {
    errors.description = PROPERTY_FORM_MESSAGES.descriptionRequired;
  }

  const distanceFromHighway = parseNumberValue(formData.distanceFromHighway);

  if (
    formData.distanceFromHighway !== undefined &&
    getTrimmedValue(formData.distanceFromHighway)
  ) {
    if (distanceFromHighway === null || Number.isNaN(distanceFromHighway)) {
      errors.distanceFromHighway = PROPERTY_FORM_MESSAGES.distanceInvalid;
    } else if (distanceFromHighway < 0) {
      errors.distanceFromHighway = PROPERTY_FORM_MESSAGES.distanceNegative;
    }
  }

  const totalImages =
    (formData.existingImages?.length || 0) + formData.images.length;

  if (totalImages === 0) {
    errors.images = PROPERTY_FORM_MESSAGES.imagesRequired;
  }

  const normalizedAreaNepali = getTrimmedValue(formData.areaNepali);

  if (
    normalizedAreaNepali &&
    !PROPERTY_AREA_NEPALI_PATTERN.test(normalizedAreaNepali)
  ) {
    errors.areaNepali = PROPERTY_FORM_MESSAGES.areaNepaliInvalid;
  }

  return errors;
};
