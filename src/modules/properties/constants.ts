export const PROPERTY_DEFAULT_CATEGORY_OPTION_VALUE = 0;
export const PROPERTY_LOCATION_EXISTING_PLACE_ID = "__existing__";
export const PROPERTY_LOCATION_DROPDOWN_CLOSE_DELAY_MS = 150;

export const PROPERTY_IMAGE_UPLOAD_LIMIT = 10;
export const PROPERTY_IMAGE_MAX_FILE_SIZE_MB = 5;
export const PROPERTY_DEFAULT_PAGE_SIZE = 9;
export const DEFAULT_HIGHWAY_DISTANCE_KM = 0;
export const ROI_OPTIONS = [
  { label: "6% +", value: "6" },
  { label: "8% +", value: "8" },
  { label: "10% +", value: "10" },
  { label: "12% +", value: "12" },
  { label: "15% +", value: "15" },
] as const;

export const PROPERTY_AREA_NEPALI_PATTERN = /^\d+-\d+-\d+-\d+(\.\d+)?$/;
export const PROPERTY_AREA_NEPALI_FORMAT_HINT = "0-0-0-0.0";

export const PROPERTY_STATUS_OPTIONS = [
  { value: "Available", label: "Available" },
  { value: "Pending", label: "Pending" },
  { value: "Sold", label: "Sold" },
] as const;

export type PropertyStatusValue =
  (typeof PROPERTY_STATUS_OPTIONS)[number]["value"];

export const PROPERTY_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "roi_desc", label: "ROI: High to Low" },
] as const;

export type PropertySortValue = (typeof PROPERTY_SORT_OPTIONS)[number]["value"];

export const PROPERTY_FORM_TEXT = {
  addTitle: "Create Property Profile",
  editTitle: "Edit Property Details",
  titleLabel: "Property Title",
  categoryLabel: "Category",
  categoryPlaceholder: "Select Category",
  locationLabel: "Full Address / Location",
  locationPlaceholder: "Search and select a location...",
  loadingLocations: "Loading suggestions...",
  noLocations: "No locations found",
  priceLabel: "Price in NPR",
  roiLabel: "Projected ROI (%)",
  statusLabel: "Current Status",
  statusPlaceholder: "Select current status",
  areaLabel: "Area (Sq Ft)",
  areaNepaliLabel: "Area (R-A-P-D)",
  areaNepaliPlaceholder: `e.g. ${PROPERTY_AREA_NEPALI_FORMAT_HINT}`,
  distanceLabel: "Distance From Highway (m)",
  imagesLabel: "Property Media",
  imagesLimitLabel: `(max ${PROPERTY_IMAGE_UPLOAD_LIMIT})`,
  imageLimitReached: "Image limit reached",
  imageUploadPrompt: "Click to upload or drag & drop",
  imageUploadHelpText: `PNG, JPG up to ${PROPERTY_IMAGE_MAX_FILE_SIZE_MB}MB each`,
  descriptionLabel: "Property Description",
  addSubmit: "Create Property Profile",
  editSubmit: "Update Property Profile",
  creatingSubmit: "Creating Property...",
  updatingSubmit: "Updating Property...",
  loading: "Loading property details...",
} as const;

export const PROPERTY_FORM_MESSAGES = {
  titleRequired: "Title is required",
  categoryRequired: "Category is required",
  locationRequired: "Please select a location from the suggestions",
  priceRequired: "Price is required",
  roiRequired: "ROI is required",
  statusRequired: "Status is required",
  areaRequired: "Area is required",
  descriptionRequired: "Description is required",
  distanceNegative: "Distance from highway cannot be negative",
  areaNepaliInvalid: `Invalid format (e.g., ${PROPERTY_AREA_NEPALI_FORMAT_HINT})`,
  imageLimitError: `You can only upload up to ${PROPERTY_IMAGE_UPLOAD_LIMIT} images.`,
  imageSizeError: `Each image must be ${PROPERTY_IMAGE_MAX_FILE_SIZE_MB}MB or smaller.`,
  addSuccess: "Property submitted successfully!",
  addError: "Failed to submit property",
  editSuccess: "Property updated successfully!",
  editError: "Failed to update property",
} as const;

export const PROPERTY_FILTER_TEXT = {
  locationPlaceholder: "Location",
  allCategoriesLabel: "All Categories",
  minPricePlaceholder: "Min Price (NPR)",
  maxPricePlaceholder: "Max Price (NPR)",
  minRoiPlaceholder: "Min ROI (%)",
  minAreaPlaceholder: "Min Area (sq ft)",
  maxDistancePlaceholder: "Max Distance (m)",
  applyButton: "Apply",
  clearButton: "Clear",
  previousButton: "Previous",
  nextButton: "Next",
} as const;
