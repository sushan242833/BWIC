import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { capitalize } from "@/utils/Capitalize";
import { assetUrl } from "@/lib/api/client";
import type { RecommendationItem } from "@/modules/recommendations/types";
import ScoreBreakdown from "@/modules/recommendations/components/ScoreBreakdown";

const formatCurrency = (value?: string) => {
  if (!value) return "Price on request";

  const numeric = Number.parseFloat(value.replace(/,/g, ""));
  if (Number.isNaN(numeric)) return `NPR ${value}`;

  return `NPR ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numeric)}`;
};

const formatArea = (value?: string) => {
  if (!value) return "Area unavailable";
  return `${value} sq ft`;
};

const formatHighwayDistance = (value?: number) => {
  if (value === undefined || value === null) return "Distance unavailable";
  return `${value} m from highway`;
};

interface RecommendationCardProps {
  item: RecommendationItem;
  rank: number;
  isTopResult?: boolean;
}

const RecommendationCard = ({
  item,
  rank,
  isTopResult = false,
}: RecommendationCardProps) => {
  const image = item.property.primaryImage || item.property.images?.[0];

  return (
    <article
      className={`overflow-hidden rounded-[32px] border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${
        isTopResult
          ? "border-blue-200 ring-1 ring-blue-100"
          : "border-slate-200"
      }`}
    >
      <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="relative min-h-[280px] bg-slate-200">
          {image ? (
            <img
              src={assetUrl(image)}
              alt={item.property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
              No property image available
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {isTopResult && (
              <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg">
                Best Match
              </span>
            )}
            <span className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-900 shadow-lg">
              Rank #{rank}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-[28px] bg-slate-950/82 p-4 text-white backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Match
                </p>
                <p className="mt-1 text-4xl font-black">{item.matchPercentage}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Score
                </p>
                <p className="mt-1 text-2xl font-bold text-cyan-300">
                  {item.score}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-slate-900">
                  {item.property.title}
                </h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {item.property.category?.name
                    ? capitalize(item.property.category.name)
                    : "Uncategorized"}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {capitalize(item.property.status || "unknown")}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-slate-500">
                {item.property.location}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Price
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrency(item.property.price)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    ROI
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {item.property.roi ? `${item.property.roi}%` : "ROI unavailable"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Area
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatArea(item.property.area)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Access
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatHighwayDistance(item.property.distanceFromHighway)}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Ranking summary
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {item.rankingSummary}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {item.topReasons.slice(0, 3).map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                  >
                    {reason}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={APP_ROUTES.propertyDetail(item.property.id)}
                  className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View full property details
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <ScoreBreakdown breakdown={item.scoreBreakdown} compact />

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <h3 className="text-base font-bold text-slate-900">
                  Why it was recommended
                </h3>
                {item.topReasons.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {item.topReasons.slice(0, 3).map((reason) => (
                      <li key={reason} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    No standout positive signal was returned for this result yet.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <h3 className="text-base font-bold text-slate-900">
                  Trade-offs and penalties
                </h3>
                {item.penalties.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {item.penalties.map((penalty) => (
                      <li key={penalty} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                        <span>{penalty}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    No major ranking penalty was detected for this property.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default RecommendationCard;
