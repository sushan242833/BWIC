import Link from "next/link";
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

interface TopRecommendationCardProps {
  item: RecommendationItem;
}

const TopRecommendationCard = ({ item }: TopRecommendationCardProps) => {
  const image = item.property.primaryImage || item.property.images?.[0];

  return (
    <section className="overflow-hidden rounded-[36px] border border-blue-200 bg-[linear-gradient(135deg,#0f172a_0%,#0b2447_50%,#0e7490_100%)] text-white shadow-[0_32px_100px_rgba(15,23,42,0.18)]">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">
              Top Recommendation
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
              Rank #1
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_160px] lg:items-start">
            <div>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                {item.property.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {item.property.category?.name
                    ? capitalize(item.property.category.name)
                    : "Uncategorized"}
                </span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                  {capitalize(item.property.status || "unknown")}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                {item.property.location}
              </p>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-100">
                {item.rankingSummary}
              </p>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 text-center backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Match
              </p>
              <p className="mt-2 text-5xl font-black">{item.matchPercentage}%</p>
              <p className="mt-3 text-sm text-cyan-100">Best alignment score</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
                Price
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {formatCurrency(item.property.price)}
              </p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
                ROI
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {item.property.roi ? `${item.property.roi}%` : "ROI unavailable"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
                Area
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {item.property.area ? `${item.property.area} sq ft` : "Area unavailable"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
                Score
              </p>
              <p className="mt-2 text-lg font-bold text-white">{item.score}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[30px] border border-white/12 bg-white/8 p-5 backdrop-blur">
              <h3 className="text-lg font-bold text-white">Why this ranked first</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.topReasons.length > 0 ? (
                  item.topReasons.slice(0, 3).map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      {reason}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-200">
                    Strong positive reasons were not returned for this result.
                  </span>
                )}
              </div>

              {item.penalties.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    Minor watch-outs
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100">
                    {item.penalties.map((penalty) => (
                      <li key={penalty} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-amber-300" />
                        <span>{penalty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-white/12 bg-white p-4 text-slate-900">
              <ScoreBreakdown breakdown={item.scoreBreakdown} compact />
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/properties/${item.property.id}`}
              className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              View full property details
            </Link>
          </div>
        </div>

        <div className="relative min-h-[320px] bg-slate-900">
          {image ? (
            <img
              src={assetUrl(image)}
              alt={item.property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm text-slate-300">
              No property image available
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.68)_100%)]" />
        </div>
      </div>
    </section>
  );
};

export default TopRecommendationCard;
