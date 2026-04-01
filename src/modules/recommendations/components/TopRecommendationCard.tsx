import Link from "next/link";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { assetUrl } from "@/lib/api/client";
import { formatPropertyReference } from "@/modules/properties/reference";
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

  const numeric = Number.parseFloat(value.replace(/,/g, ""));
  if (Number.isNaN(numeric)) return `${value} sq ft`;

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 1,
  }).format(numeric)} sq ft`;
};

const formatPercent = (value?: string) => {
  if (!value) return "ROI unavailable";

  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return value;

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 1,
  }).format(numeric)}%`;
};

const formatScore = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

interface TopRecommendationCardProps {
  item: RecommendationItem;
}

const TopRecommendationCard = ({ item }: TopRecommendationCardProps) => {
  const image = item.property.primaryImage || item.property.images?.[0];
  const topReasons = item.topReasons.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#d8def3] bg-white shadow-[0_24px_70px_rgba(19,27,46,0.08)]">
      <div className="grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[320px] overflow-hidden bg-[#dde4ff] xl:min-h-[440px]">
          {image ? (
            <img
              src={assetUrl(image)}
              alt={item.property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#2e63d4_0%,#1e3a8a_48%,#0f172a_100%)] px-8 text-center font-auth-body text-sm text-white/80">
              No property image available
            </div>
          )}

          <div className="absolute left-6 top-6 rounded-full bg-[linear-gradient(135deg,#645efb_0%,#4b41e1_100%)] px-4 py-2 font-auth-body text-sm font-semibold text-white shadow-lg shadow-[#4b41e1]/30">
            Match {item.matchPercentage}%
          </div>
        </div>

        <div className="flex flex-col justify-between p-8 sm:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-[#dbe1ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#22336f]">
                Prime Pick
              </span>
              <span className="font-auth-body text-sm text-[#5b6275]">
                ID: {formatPropertyReference(item.property.id)}
              </span>
            </div>

            <h2 className="mt-5 font-auth-headline text-4xl font-bold leading-tight text-[#131b2e]">
              {item.property.title}
            </h2>

            <p className="mt-3 font-auth-body text-base text-[#5b6275]">
              {item.property.location}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#434655]">
                  Price
                </div>
                <div className="mt-2 font-auth-headline text-[2rem] font-semibold text-[#131b2e]">
                  {formatCurrency(item.property.price)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#434655]">
                  ROI
                </div>
                <div className="mt-2 font-auth-headline text-[2rem] font-semibold text-[#2f49d1]">
                  {formatPercent(item.property.roi)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#434655]">
                  Area
                </div>
                <div className="mt-2 font-auth-headline text-[2rem] font-semibold text-[#131b2e]">
                  {formatArea(item.property.area)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#434655]">
                  Score
                </div>
                <div className="mt-2 font-auth-headline text-[2rem] font-semibold text-[#131b2e]">
                  {formatScore(item.score)}
                </div>
              </div>
            </div>
          </div>

          <Link
            href={APP_ROUTES.propertyDetail(item.property.id)}
            className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#004ac6_0%,#4b41e1_100%)] px-6 py-4 text-center font-auth-body text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-[#004ac6]/20 transition hover:opacity-95"
          >
            View Full Property Details
          </Link>
        </div>
      </div>

      <div className="grid gap-8 border-t border-[#e5e9f8] bg-[#f5f7ff] px-8 py-8 lg:grid-cols-3">
        <div className="space-y-5">
          <h3 className="font-auth-headline text-sm font-bold uppercase tracking-[0.24em] text-[#434655]">
            Why This Ranked First
          </h3>

          {topReasons.length > 0 ? (
            <ul className="space-y-4">
              {topReasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 font-auth-body text-base text-[#131b2e]"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#004ac6]" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-auth-body text-sm leading-7 text-[#5b6275]">
              Strong positive signals were not returned for this result yet.
            </p>
          )}
        </div>

        <div className="space-y-5">
          <h3 className="font-auth-headline text-sm font-bold uppercase tracking-[0.24em] text-[#434655]">
            Minor Watch-outs
          </h3>

          {item.penalties.length > 0 ? (
            <div className="space-y-3">
              {item.penalties.map((penalty) => (
                <div
                  key={penalty}
                  className="flex items-start gap-3 rounded-2xl bg-[#e8edff] p-4 font-auth-body text-base text-[#131b2e]"
                >
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <span>{penalty}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#eaf7f0] p-4 font-auth-body text-sm text-[#21563b]">
              No major trade-offs were detected for this recommendation.
            </div>
          )}
        </div>

        <div>
          <ScoreBreakdown breakdown={item.scoreBreakdown} compact />
        </div>
      </div>
    </section>
  );
};

export default TopRecommendationCard;
