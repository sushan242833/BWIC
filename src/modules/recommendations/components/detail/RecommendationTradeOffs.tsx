import { TriangleAlert } from "lucide-react";
import type { RecommendationDetailAnalysis } from "@/modules/recommendations/types";

interface RecommendationTradeOffsProps {
  recommendation: RecommendationDetailAnalysis;
}

const RecommendationTradeOffs = ({
  recommendation,
}: RecommendationTradeOffsProps) => {
  const fallbackPenalties = recommendation.explanation
    .filter((item) => item.sentiment === "negative")
    .map((item) => item.reason);
  const tradeOffs =
    recommendation.penalties.length > 0
      ? recommendation.penalties
      : fallbackPenalties;

  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-3 font-auth-headline text-3xl font-bold text-[#131b2e]">
        <TriangleAlert className="h-7 w-7 text-[#ba1a1a]" />
        Trade-offs and Penalties
      </h2>

      {tradeOffs.length > 0 ? (
        <div className="space-y-4">
          {tradeOffs.map((tradeOff) => (
            <div
              key={tradeOff}
              className="rounded-lg border border-red-100 bg-red-50 p-5"
            >
              <p className="font-auth-body text-base leading-7 text-red-900">
                {tradeOff}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-green-100 bg-green-50 p-5">
          <p className="font-auth-body text-sm leading-7 text-green-900">
            No major trade-offs were returned for this recommendation.
          </p>
        </div>
      )}
    </section>
  );
};

export default RecommendationTradeOffs;
