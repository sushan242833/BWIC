import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { assetUrl } from "@/lib/api/client";
import type { RecommendationItem } from "@/modules/recommendations/types";

const formatCurrency = (value?: string) => {
  if (!value) return "Price on request";

  const numeric = Number.parseFloat(value.replace(/,/g, ""));
  if (Number.isNaN(numeric)) return `NPR ${value}`;

  return `NPR ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numeric)}`;
};

const formatPercent = (value?: string) => {
  if (!value) return "ROI unavailable";

  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return value;

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 1,
  }).format(numeric)}%`;
};

interface RecommendationCardProps {
  item: RecommendationItem;
  rank: number;
}

const RecommendationCard = ({ item, rank }: RecommendationCardProps) => {
  const image = item.property.primaryImage || item.property.images?.[0];

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#dde3f5] bg-white shadow-[0_22px_60px_rgba(19,27,46,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(19,27,46,0.1)]">
      <div className="relative h-56 overflow-hidden bg-[radial-gradient(circle_at_top,#13325c_0%,#0b1120_65%,#070b15_100%)]">
        {image ? (
          <img
            src={assetUrl(image)}
            alt={item.property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#102039_0%,#0b1326_100%)] px-6 text-center font-auth-body text-sm text-white/70">
            Property image unavailable
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,21,0.02)_0%,rgba(7,11,21,0.18)_100%)]" />

        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#131b2e] backdrop-blur">
          Rank #{rank}
        </div>
        <div className="absolute right-4 top-4 rounded-lg bg-white px-3 py-1 text-sm font-semibold text-[#131b2e] shadow-sm">
          {item.matchPercentage}% Match
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <h3 className="font-auth-headline text-[1.9rem] font-bold leading-tight text-[#131b2e]">
            {item.property.title}
          </h3>
          <p className="mt-2 font-auth-body text-sm text-[#5b6275]">
            {item.property.location}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#434655]">
              Price
            </div>
            <div className="mt-1 font-auth-headline text-[1.7rem] font-semibold text-[#131b2e]">
              {formatCurrency(item.property.price)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#434655]">
              ROI
            </div>
            <div className="mt-1 font-auth-headline text-[1.7rem] font-semibold text-[#2f49d1]">
              {formatPercent(item.property.roi)}
            </div>
          </div>
        </div>

        <Link
          href={APP_ROUTES.propertyDetail(item.property.id)}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[#004ac6] px-5 py-3 text-center font-auth-body text-xs font-semibold uppercase tracking-[0.18em] text-[#004ac6] transition hover:bg-[#eef2ff]"
        >
          Details
        </Link>
      </div>
    </article>
  );
};

export default RecommendationCard;
