import type { PropertyFormData } from "@/modules/properties/types";

export const createEmptyPropertyFormData = (): PropertyFormData => ({
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
  existingImages: [],
  description: "",
});

export const buildPropertyFormPayload = (
  formData: PropertyFormData,
): FormData => {
  const form = new FormData();

  form.append("title", formData.title);
  form.append("categoryId", String(formData.categoryId));
  form.append("location", formData.location);
  form.append("price", formData.price);
  form.append("roi", formData.roi);
  form.append("status", formData.status);
  form.append("area", formData.area);

  if (formData.areaNepali) {
    form.append("areaNepali", formData.areaNepali);
  }

  if (formData.distanceFromHighway !== undefined) {
    form.append("distanceFromHighway", String(formData.distanceFromHighway));
  }

  form.append("description", formData.description);

  formData.images.forEach((file) => {
    form.append("images", file);
  });

  if (formData.existingImages && formData.existingImages.length > 0) {
    form.append("existingImages", JSON.stringify(formData.existingImages));
  }

  return form;
};
