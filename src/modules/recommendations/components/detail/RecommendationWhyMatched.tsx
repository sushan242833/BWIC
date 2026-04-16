import { CheckCircle2 } from "lucide-react";
import type { RecommendationDetailAnalysis } from "@/modules/recommendations/types";

interface RecommendationWhyMatchedProps {
  recommendation: RecommendationDetailAnalysis;
}

const RecommendationWhyMatched = ({
  recommendation,
}: RecommendationWhyMatchedProps) => {
  const fallbackReasons = recommendation.explanation
    .filter((item) => item.sentiment === "positive")
    .map((item) => item.reason);
  const reasons =
    recommendation.topReasons.length > 0
      ? recommendation.topReasons
      : fallbackReasons;

  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-3 font-auth-headline text-3xl font-bold text-[#131b2e]">
        <CheckCircle2 className="h-7 w-7 text-green-600" />
        Why It Matched
      </h2>

      {reasons.length > 0 ? (
        <div className="space-y-4">
          {reasons.map((reason) => (
            <div
              key={reason}
              className="rounded-lg border border-green-100 bg-green-50 p-5"
            >
              <p className="font-auth-body text-base leading-7 text-green-900">
                {reason}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#e1e6f7] bg-[#fafbff] p-5">
          <p className="font-auth-body text-sm leading-7 text-[#5b6275]">
            No positive match reasons were returned for the current request.
          </p>
        </div>
      )}
    </section>
  );
};

export default RecommendationWhyMatched;
