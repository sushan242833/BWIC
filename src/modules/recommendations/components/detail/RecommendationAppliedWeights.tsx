import {
  formatScore,
  getScoreLabel,
  RECOMMENDATION_SCORE_KEYS,
} from "@/modules/recommendations/detail-formatters";
import type { RecommendationResponseMeta } from "@/modules/recommendations/types";

interface RecommendationAppliedWeightsProps {
  meta: RecommendationResponseMeta;
}

const RecommendationAppliedWeights = ({
  meta,
}: RecommendationAppliedWeightsProps) => {
  const sourceLabel =
    meta.weightSource === "user"
      ? "Personalized user weights"
      : "Default system weights";

  return (
    <section className="rounded-lg bg-[#d2d9f4] p-6 sm:p-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-auth-headline text-3xl font-bold text-[#131b2e]">
            Applied Weights
          </h2>
          <p className="mt-2 font-auth-body text-sm leading-7 text-[#434655]">
            This is the exact weight set returned by the recommendation API for
            this scoring run.
          </p>
        </div>
        <span className="w-fit rounded bg-white/70 px-3 py-2 font-auth-body text-xs font-bold uppercase tracking-[0.14em] text-[#131b2e]">
          {sourceLabel}
        </span>
      </div>

      <div className="space-y-4">
        {RECOMMENDATION_SCORE_KEYS.map((key) => {
          const weight = meta.appliedWeights[key] ?? 0;

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-auth-body text-sm font-bold text-[#131b2e]">
                  {getScoreLabel(key)}
                </p>
                <p className="font-auth-headline text-lg font-bold text-[#131b2e]">
                  {formatScore(weight)}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-[#004ac6]"
                  style={{ width: `${Math.min(100, Math.max(0, weight))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendationAppliedWeights;
