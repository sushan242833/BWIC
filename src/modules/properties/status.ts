import {
  PROPERTY_STATUS_OPTIONS,
  type PropertyStatusValue,
} from "@/modules/properties/constants";

const propertyStatusLookup = PROPERTY_STATUS_OPTIONS.reduce<
  Record<string, PropertyStatusValue>
>((lookup, option) => {
  lookup[option.value.toLowerCase()] = option.value;
  return lookup;
}, {});

const titleCase = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value;

export const normalizePropertyStatus = (
  status?: string | null,
): PropertyStatusValue | null => {
  if (!status) {
    return null;
  }

  return propertyStatusLookup[status.trim().toLowerCase()] ?? null;
};

export const formatPropertyStatus = (status?: string | null): string => {
  const normalized = normalizePropertyStatus(status);
  if (normalized) {
    return normalized;
  }

  const trimmed = status?.trim();
  return trimmed ? titleCase(trimmed) : "Unknown";
};

export const getPropertyStatusTextClass = (status?: string | null): string => {
  switch (normalizePropertyStatus(status)) {
    case "Available":
      return "text-green-600";
    case "Pending":
      return "text-yellow-500";
    case "Sold":
      return "text-red-600";
    default:
      return "text-slate-600";
  }
};

export const getPropertyStatusBadgeClass = (status?: string | null): string => {
  switch (normalizePropertyStatus(status)) {
    case "Available":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Sold":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
