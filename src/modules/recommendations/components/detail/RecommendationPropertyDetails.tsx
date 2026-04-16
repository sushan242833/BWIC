import {
  formatAreaValue,
  formatCompactRecommendationCurrency,
  formatDateValue,
  formatHighwayDistance,
  formatPercentValue,
} from "@/modules/recommendations/detail-formatters";
import { formatPropertyStatus } from "@/modules/properties/status";
import type { PropertySummary } from "@/modules/properties/types";

interface RecommendationPropertyDetailsProps {
  property: PropertySummary;
}

const RecommendationPropertyDetails = ({
  property,
}: RecommendationPropertyDetailsProps) => {
  const details = [
    {
      label: "Category",
      value: property.category?.name ?? "Uncategorized",
    },
    {
      label: "Location",
      value: property.location,
    },
    {
      label: "Price",
      value: formatCompactRecommendationCurrency(property.price),
    },
    {
      label: "Target ROI",
      value: formatPercentValue(property.roi),
    },
    {
      label: "Total area",
      value: formatAreaValue(property.area),
    },
    {
      label: "Nepali area",
      value: property.areaNepali || "Not available",
    },
    {
      label: "Highway proximity",
      value: formatHighwayDistance(property.distanceFromHighway),
    },
    {
      label: "Status",
      value: formatPropertyStatus(property.status),
    },
    {
      label: "Listed",
      value: formatDateValue(property.createdAt),
    },
    {
      label: "Updated",
      value: formatDateValue(property.updatedAt),
    },
  ];

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_20px_45px_rgba(19,27,46,0.05)] sm:p-8">
      <div className="mb-7">
        <h2 className="font-auth-headline text-3xl font-bold text-[#131b2e]">
          Full Property Details
        </h2>
        <p className="mt-2 font-auth-body text-sm leading-7 text-[#5b6275]">
          The listing information shown here is the real property record used by
          the recommendation engine.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {details.map((item) => (
          <div key={item.label} className="rounded-lg bg-[#f2f3ff] p-4">
            <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa0b5]">
              {item.label}
            </p>
            <p className="mt-2 font-auth-headline text-lg font-bold text-[#131b2e]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 rounded-lg border border-[#e1e6f7] bg-[#fafbff] p-5">
        <p className="font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-[#737686]">
          Description
        </p>
        <p className="mt-3 whitespace-pre-line font-auth-body text-base leading-8 text-[#283044]">
          {property.description || "No description is available for this property."}
        </p>
      </div>
    </section>
  );
};

export default RecommendationPropertyDetails;
