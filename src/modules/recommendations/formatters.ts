export const formatRecommendationCurrency = (
  value?: string | number | null,
): string => {
  if (value === undefined || value === null || value === "") {
    return "Price on request";
  }

  const normalized =
    typeof value === "number" ? value : value.replace(/,/g, "");
  const numeric = Number.parseFloat(String(normalized));

  if (Number.isNaN(numeric)) {
    return `NPR ${value}`;
  }

  return `NPR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(numeric)}`;
};
