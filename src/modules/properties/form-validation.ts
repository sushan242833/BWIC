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
  }

  if (!getTrimmedValue(formData.roi)) {
    errors.roi = PROPERTY_FORM_MESSAGES.roiRequired;
  }

  if (!getTrimmedValue(formData.status)) {
    errors.status = PROPERTY_FORM_MESSAGES.statusRequired;
  }

  if (!getTrimmedValue(formData.area)) {
    errors.area = PROPERTY_FORM_MESSAGES.areaRequired;
  }

  if (!getTrimmedValue(formData.description)) {
    errors.description = PROPERTY_FORM_MESSAGES.descriptionRequired;
  }

  if (
    formData.distanceFromHighway !== undefined &&
    formData.distanceFromHighway < 0
  ) {
    errors.distanceFromHighway = PROPERTY_FORM_MESSAGES.distanceNegative;
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
