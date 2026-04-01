import { PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE } from "@/modules/properties/constants";
import type {
  PropertyDetail,
  PropertyFormData,
} from "@/modules/properties/types";

const toFormTextValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export const createEmptyPropertyFormData = (): PropertyFormData => ({
  title: "",
  categoryId: PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE,
  location: "",
  price: "",
  roi: "",
  status: "",
  area: "",
  areaNepali: "",
  distanceFromHighway: undefined,
  images: [],
  existingImages: [],
  description: "",
});

export const createPropertyFormDataFromDetail = (
  property: PropertyDetail,
): PropertyFormData => ({
  title: property.title ?? "",
  categoryId: property.categoryId ?? PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE,
  location: property.location ?? "",
  price: toFormTextValue(property.price),
  roi: toFormTextValue(property.roi),
  status: property.status ?? "",
  area: toFormTextValue(property.area),
  areaNepali: property.areaNepali ?? "",
  distanceFromHighway: property.distanceFromHighway,
  images: [],
  existingImages: property.images ?? [],
  description: property.description ?? "",
});

export const buildPropertyFormPayload = (
  formData: PropertyFormData,
): FormData => {
  const form = new FormData();

  form.append("title", String(formData.title));
  form.append("categoryId", String(formData.categoryId));
  form.append("location", String(formData.location));
  form.append("price", String(formData.price));
  form.append("roi", String(formData.roi));
  form.append("status", String(formData.status));
  form.append("area", String(formData.area));

  if (formData.areaNepali) {
    form.append("areaNepali", formData.areaNepali);
  }

  if (formData.distanceFromHighway !== undefined) {
    form.append("distanceFromHighway", String(formData.distanceFromHighway));
  }

  form.append("description", String(formData.description));

  formData.images.forEach((file) => {
    form.append("images", file);
  });

  if (formData.existingImages && formData.existingImages.length > 0) {
    form.append("existingImages", JSON.stringify(formData.existingImages));
  }

  return form;
};
