import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { assetUrl } from "@/lib/api/client";
import {
  formatAreaValue,
  formatCompactRecommendationCurrency,
  formatHighwayDistance,
  formatPercentValue,
} from "@/modules/recommendations/detail-formatters";
import { formatPropertyStatus } from "@/modules/properties/status";
import type {
  RecommendationDetailAnalysis,
} from "@/modules/recommendations/types";
import type { PropertySummary } from "@/modules/properties/types";

interface RecommendationHeroProps {
  property: PropertySummary;
  recommendation: RecommendationDetailAnalysis;
}

const RecommendationHero = ({
  property,
  recommendation,
}: RecommendationHeroProps) => {
  const images = useMemo(
    () => property.images?.filter(Boolean) ?? [],
    [property.images],
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const activeImage = images[selectedImage] || property.primaryImage;
  const rankLabel =
    recommendation.rank === null
      ? "Recommendation"
      : `Rank #${recommendation.rank}`;

  return (
    <section className="grid gap-10 lg:grid-cols-12 lg:items-end">
      <div className="space-y-7 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#645efb] px-4 py-1.5 font-auth-body text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            {recommendation.matchPercentage}% Match
          </span>
          <span className="rounded-full bg-[#2563eb] px-4 py-1.5 font-auth-body text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            {rankLabel}
          </span>
          {property.category?.name && (
            <span className="rounded-full border border-[#c3c6d7] bg-white/70 px-4 py-1.5 font-auth-body text-[11px] font-bold uppercase tracking-[0.18em] text-[#283044]">
              {property.category.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 font-auth-body text-sm font-semibold text-[#434655]">
            <MapPin className="h-4 w-4" />
            {property.location}
          </span>
        </div>

        <div>
          <h1 className="font-auth-headline text-4xl font-bold leading-tight text-[#131b2e] sm:text-5xl lg:text-6xl">
            {property.title}
          </h1>
          <p className="mt-5 max-w-2xl font-auth-body text-base leading-8 text-[#434655]">
            {recommendation.rankingSummary}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-[#737686]">
              Starting Investment
            </p>
            <p className="mt-2 font-auth-headline text-4xl font-extrabold text-[#004ac6]">
              {formatCompactRecommendationCurrency(property.price)}
            </p>
          </div>

          <div className="sm:ml-auto">
            <span className="inline-flex rounded bg-green-100 px-3 py-1 font-auth-body text-xs font-bold uppercase tracking-[0.12em] text-green-800">
              {formatPropertyStatus(property.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-[#f2f3ff] px-4 py-4">
            <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
              Score
            </p>
            <p className="mt-2 font-auth-headline text-xl font-bold text-[#131b2e]">
              {recommendation.score}
            </p>
          </div>
          <div className="rounded-lg bg-[#f2f3ff] px-4 py-4">
            <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
              ROI
            </p>
            <p className="mt-2 font-auth-headline text-xl font-bold text-[#131b2e]">
              {formatPercentValue(property.roi)}
            </p>
          </div>
          <div className="rounded-lg bg-[#f2f3ff] px-4 py-4">
            <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
              Area
            </p>
            <p className="mt-2 font-auth-headline text-xl font-bold text-[#131b2e]">
              {formatAreaValue(property.area)}
            </p>
          </div>
          <div className="rounded-lg bg-[#f2f3ff] px-4 py-4">
            <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
              Highway
            </p>
            <p className="mt-2 font-auth-headline text-xl font-bold text-[#131b2e]">
              {formatHighwayDistance(property.distanceFromHighway)}
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="overflow-hidden rounded-lg border border-[#d9def0] bg-[#dbe1ff] shadow-[0_26px_70px_rgba(19,27,46,0.12)]">
          <div className="relative h-[320px] sm:h-[420px] lg:h-[500px]">
            {activeImage ? (
              <img
                src={assetUrl(activeImage)}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#131b2e] px-8 text-center font-auth-body text-sm text-white/80">
                Property image unavailable
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-4">
              <p className="font-auth-body text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                Recommendation-aware property view
              </p>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto bg-white p-3">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded border transition ${
                    selectedImage === index
                      ? "border-[#004ac6]"
                      : "border-[#d9def0] hover:border-[#9badde]"
                  }`}
                >
                  <img
                    src={assetUrl(image)}
                    alt={`${property.title} image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RecommendationHero;
