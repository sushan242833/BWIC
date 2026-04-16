import {
  formatScore,
  getBreakdownContribution,
  getScoreLabel,
  RECOMMENDATION_SCORE_KEYS,
} from "@/modules/recommendations/detail-formatters";
import type { RecommendationWeights } from "@/modules/recommendation-settings/types";
import type { RecommendationScoreBreakdown as ScoreBreakdownType } from "@/modules/recommendations/types";

interface RecommendationScoreBreakdownProps {
  breakdown?: ScoreBreakdownType;
  appliedWeights: RecommendationWeights;
}

const RecommendationScoreBreakdown = ({
  breakdown,
  appliedWeights,
}: RecommendationScoreBreakdownProps) => {
  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_20px_45px_rgba(19,27,46,0.05)] sm:p-8">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-auth-headline text-3xl font-bold text-[#131b2e]">
            Score Breakdown
          </h2>
          <p className="mt-2 font-auth-body text-sm leading-7 text-[#5b6275]">
            Contribution is the real number of points this property earned from
            each weighted factor.
          </p>
        </div>
        <span className="rounded bg-[#eef2ff] px-3 py-2 font-auth-body text-xs font-bold uppercase tracking-[0.14em] text-[#004ac6]">
          Total weight 100
        </span>
      </div>

      <div className="space-y-4">
        {RECOMMENDATION_SCORE_KEYS.map((key) => {
          const contribution = getBreakdownContribution(breakdown, key);
          const weight = appliedWeights[key] ?? 0;
          const factorScore =
            contribution !== undefined && weight > 0
              ? Math.min(100, Math.max(0, Math.round((contribution / weight) * 100)))
              : null;
          const width = factorScore ?? 0;

          return (
            <div
              key={key}
              className="rounded-lg border border-[#e1e6f7] bg-[#fafbff] p-4"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                <div>
                  <p className="font-auth-headline text-lg font-bold text-[#131b2e]">
                    {getScoreLabel(key)}
                  </p>
                  <p className="mt-1 font-auth-body text-xs font-medium text-[#737686]">
                    {contribution === undefined
                      ? "This factor was not scored for the current request."
                      : "Scored against the request context returned by the API."}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
                    Contribution
                  </p>
                  <p className="mt-1 font-auth-headline text-lg font-bold text-[#131b2e]">
                    {formatScore(contribution ?? 0)} / {formatScore(weight)}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
                    Factor Score
                  </p>
                  <p className="mt-1 font-auth-headline text-lg font-bold text-[#4b41e1]">
                    {factorScore === null ? "N/A" : `${factorScore}%`}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
                    Applied Weight
                  </p>
                  <p className="mt-1 font-auth-headline text-lg font-bold text-[#131b2e]">
                    {formatScore(weight)}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dbe1ff]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#004ac6_0%,#4b41e1_100%)]"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendationScoreBreakdown;
