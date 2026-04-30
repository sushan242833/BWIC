import type { RecommendationPreferences } from "@/modules/recommendations/types";

export type RecommendationFormErrors = Partial<
  Record<keyof RecommendationPreferences | "form", string>
>;

const parsePositiveNumber = (value: string): number | null => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const validateRecommendationForm = (
  values: RecommendationPreferences,
  options: {
    requiresLocationSelection: boolean;
  },
): RecommendationFormErrors => {
  const errors: RecommendationFormErrors = {};

  const price = parsePositiveNumber(values.price);
  if (price !== null) {
    if (Number.isNaN(price)) {
      errors.price = "Enter a valid price.";
    } else if (price <= 0) {
      errors.price = "Price must be greater than 0.";
    }
  }

  const area = parsePositiveNumber(values.area);
  if (area !== null) {
    if (Number.isNaN(area)) {
      errors.area = "Enter a valid area.";
    } else if (area <= 0) {
      errors.area = "Area must be greater than 0.";
    }
  }

  if (options.requiresLocationSelection) {
    errors.location =
      "Please choose one of the suggested locations before continuing.";
  }

  return errors;
};
