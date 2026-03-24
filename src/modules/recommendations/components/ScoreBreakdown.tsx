import {
  RECOMMENDATION_SCORE_LABELS,
  RECOMMENDATION_SCORE_WEIGHTS,
} from "@/modules/recommendations/constants";
import type { RecommendationScoreBreakdown } from "@/modules/recommendations/types";

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
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
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-base font-bold text-slate-900">Score breakdown</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Add more preference signals to unlock a deeper weighted breakdown for
          this result.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900">Score breakdown</h3>
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Weighted
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {entries.map(([key, value]) => {
          const maxWeight =
            RECOMMENDATION_SCORE_WEIGHTS[
              key as keyof typeof RECOMMENDATION_SCORE_WEIGHTS
            ] || 0;
          const widthPercent =
            maxWeight > 0
              ? Math.min(100, Math.max(0, (Number(value) / maxWeight) * 100))
              : 0;

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-600">
                  {RECOMMENDATION_SCORE_LABELS[
                    key as keyof typeof RECOMMENDATION_SCORE_LABELS
                  ] || key}
                </span>
                <span className="font-bold text-slate-900">
                  {formatNumber(value)} pts
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#1d4ed8_100%)]"
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
