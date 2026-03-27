import {
  RECOMMENDATION_SCORE_LABELS,
  RECOMMENDATION_SCORE_WEIGHTS,
} from "@/modules/recommendations/constants";
import type { RecommendationScoreBreakdown } from "@/modules/recommendations/types";

const getPercentFromWeight = (key: string, value: number) => {
  const maxWeight =
    RECOMMENDATION_SCORE_WEIGHTS[
      key as keyof typeof RECOMMENDATION_SCORE_WEIGHTS
    ] || 0;

  if (maxWeight <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / maxWeight) * 100)));
};

interface ScoreBreakdownProps {
  breakdown?: RecommendationScoreBreakdown;
  compact?: boolean;
}

const ScoreBreakdown = ({
  breakdown,
  compact = false,
}: ScoreBreakdownProps) => {
  const entries = Object.entries(breakdown || {}).filter(
    ([, value]) => typeof value === "number",
  );

  if (entries.length === 0) {
    return (
      <div
        className={`rounded-[24px] ${
          compact
            ? "bg-white/80 p-5"
            : "border border-[#e2e7ff] bg-white p-5 shadow-[0_14px_40px_rgba(19,27,46,0.04)]"
        }`}
      >
        <h3 className="font-auth-headline text-sm font-bold uppercase tracking-[0.24em] text-[#434655]">
          Score Breakdown
        </h3>
        <p className="mt-3 text-sm leading-6 text-[#5b6275]">
          Add more preference signals to unlock a deeper weighted breakdown for
          this result.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[24px] ${
        compact
          ? "bg-white/80 p-5"
          : "border border-[#e2e7ff] bg-white p-5 shadow-[0_14px_40px_rgba(19,27,46,0.04)]"
      }`}
    >
      <div>
        <h3 className="font-auth-headline text-sm font-bold uppercase tracking-[0.24em] text-[#434655]">
          Score Breakdown
        </h3>
      </div>

      <div className="mt-4 space-y-4">
        {entries.map(([key, value]) => {
          const widthPercent = getPercentFromWeight(key, Number(value));

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#131b2e]">
                <span>
                  {RECOMMENDATION_SCORE_LABELS[
                    key as keyof typeof RECOMMENDATION_SCORE_LABELS
                  ] || key}
                </span>
                <span>{widthPercent}%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#dbe1ff]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#004ac6_0%,#4b41e1_100%)]"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
