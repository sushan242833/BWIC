import {
  PROPERTY_AREA_NEPALI_PATTERN,
  PROPERTY_FORM_MESSAGES,
} from "@/modules/properties/constants";
import type { PropertyFormData } from "@/modules/properties/types";

interface ValidatePropertyFormOptions {
  hasSelectedLocation: boolean;
}

export const validatePropertyForm = (
  formData: PropertyFormData,
  options: ValidatePropertyFormOptions,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.title.trim()) {
    errors.title = PROPERTY_FORM_MESSAGES.titleRequired;
  }

  if (!formData.categoryId) {
    errors.categoryId = PROPERTY_FORM_MESSAGES.categoryRequired;
  }

  if (!formData.location.trim() || !options.hasSelectedLocation) {
    errors.location = PROPERTY_FORM_MESSAGES.locationRequired;
  }

  if (!formData.price.trim()) {
    errors.price = PROPERTY_FORM_MESSAGES.priceRequired;
  }

  if (!formData.roi.trim()) {
    errors.roi = PROPERTY_FORM_MESSAGES.roiRequired;
  }

  if (!formData.status.trim()) {
    errors.status = PROPERTY_FORM_MESSAGES.statusRequired;
  }

  if (!formData.area.trim()) {
    errors.area = PROPERTY_FORM_MESSAGES.areaRequired;
  }

  if (!formData.description.trim()) {
    errors.description = PROPERTY_FORM_MESSAGES.descriptionRequired;
  }

  if (
    formData.distanceFromHighway !== undefined &&
    formData.distanceFromHighway < 0
  ) {
    errors.distanceFromHighway = PROPERTY_FORM_MESSAGES.distanceNegative;
  }

  if (
    formData.areaNepali &&
    !PROPERTY_AREA_NEPALI_PATTERN.test(formData.areaNepali)
  ) {
    errors.areaNepali = PROPERTY_FORM_MESSAGES.areaNepaliInvalid;
  }

  return errors;
};
