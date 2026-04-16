import { BrainCircuit } from "lucide-react";
import { RECOMMENDATION_SCORE_LABELS } from "@/modules/recommendations/constants";
import { formatScore } from "@/modules/recommendations/detail-formatters";
import type {
  RecommendationDetailAnalysis,
  RecommendationResponseMeta,
} from "@/modules/recommendations/types";

interface RecommendationSummaryCardProps {
  recommendation: RecommendationDetailAnalysis;
  meta: RecommendationResponseMeta;
}

const RecommendationSummaryCard = ({
  recommendation,
  meta,
}: RecommendationSummaryCardProps) => {
  const explanationDetails = recommendation.explanation ?? [];
  const rankText =
    recommendation.rank === null
      ? "Not in current ranked shortlist"
      : `Rank #${recommendation.rank}`;

  return (
    <section className="rounded-lg border-l-4 border-[#004ac6] bg-white p-6 shadow-[0_20px_45px_rgba(19,27,46,0.05)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded bg-[#eef2ff] px-3 py-2 font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-[#004ac6]">
            <BrainCircuit className="h-4 w-4" />
            Recommendation Intelligence
          </div>
          <h2 className="font-auth-headline text-3xl font-bold text-[#131b2e]">
            Property fit analysis
          </h2>
          <p className="mt-3 font-auth-body text-base leading-8 text-[#434655]">
            {recommendation.rankingSummary}
          </p>
        </div>

        <div className="grid min-w-[260px] grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#f2f3ff] p-4 text-center">
            <p className="font-auth-headline text-4xl font-extrabold text-[#4b41e1]">
              {recommendation.matchPercentage}%
            </p>
            <p className="mt-1 font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa0b5]">
              Match
            </p>
          </div>
          <div className="rounded-lg bg-[#f2f3ff] p-4 text-center">
            <p className="font-auth-headline text-4xl font-extrabold text-[#131b2e]">
              {formatScore(recommendation.score)}
            </p>
            <p className="mt-1 font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa0b5]">
              Score
            </p>
          </div>
          <div className="col-span-2 rounded-lg bg-[#131b2e] p-4 text-center text-white">
            <p className="font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-white/60">
              Ranking Status
            </p>
            <p className="mt-1 font-auth-headline text-xl font-bold">
              {rankText}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-[#dae2fd] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-auth-body text-sm font-bold uppercase tracking-[0.18em] text-[#737686]">
            Explanation Details
          </h3>
          <span className="rounded bg-[#eef2ff] px-3 py-1 font-auth-body text-xs font-semibold text-[#004ac6]">
            {meta.weightSource === "user"
              ? "Personalized weights"
              : "Default weights"}
          </span>
        </div>

        {explanationDetails.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {explanationDetails.map((item) => (
              <div
                key={`${item.category}-${item.reason}`}
                className="rounded-lg border border-[#e1e6f7] bg-[#fafbff] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-[#004ac6]">
                    {RECOMMENDATION_SCORE_LABELS[
                      item.category as keyof typeof RECOMMENDATION_SCORE_LABELS
                    ] ?? item.category}
                  </p>
                  <span className="font-auth-headline text-lg font-bold text-[#131b2e]">
                    {formatScore(item.points)} pts
                  </span>
                </div>
                <p className="mt-2 font-auth-body text-sm leading-6 text-[#434655]">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-[#f7f9ff] p-4 font-auth-body text-sm leading-7 text-[#5b6275]">
            No factor-level explanation was returned for this property because
            the request did not include scoreable preferences.
          </p>
        )}
      </div>
    </section>
  );
};

export default RecommendationSummaryCard;
