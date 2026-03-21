import type {
  RecommendationItem,
  RecommendationPagination,
  RecommendationPreferences,
} from "@/modules/recommendations/types";
import RecommendationCard from "@/modules/recommendations/components/RecommendationCard";
import TopRecommendationCard from "@/modules/recommendations/components/TopRecommendationCard";

interface RecommendationResultsProps {
  recommendations: RecommendationItem[];
  pagination: RecommendationPagination;
  loading: boolean;
  error: string;
  hasAppliedPreferences: boolean;
  appliedPreferences: RecommendationPreferences;
  onPageChange: (page: number) => void;
}

const getSummaryText = (
  total: number,
  appliedPreferences: RecommendationPreferences,
) => {
  const anchors = [
    appliedPreferences.location ? "location" : null,
    appliedPreferences.price ? "budget" : null,
    appliedPreferences.roi ? "ROI target" : null,
    appliedPreferences.area ? "area" : null,
    appliedPreferences.maxDistanceFromHighway ? "access preference" : null,
  ].filter(Boolean);

  if (anchors.length === 0) {
    return `Showing ${total} ranked matches.`;
  }

  return `Showing ${total} ranked matches based on your ${anchors.join(", ")} preferences.`;
};

const buildPageNumbers = (
  currentPage: number,
  totalPages: number,
): number[] => {
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  const pages = new Set<number>([1, totalPages]);

  for (let page = start; page <= end; page += 1) {
    pages.add(page);
  }

  return [...pages].sort((a, b) => a - b);
};

const RecommendationResults = ({
  recommendations,
  pagination,
  loading,
  error,
  hasAppliedPreferences,
  appliedPreferences,
  onPageChange,
}: RecommendationResultsProps) => {
  const [topResult, ...otherResults] = recommendations;
  const compareTopThree = recommendations.slice(0, 3);
  const pageNumbers = buildPageNumbers(
    pagination.page,
    Math.max(1, pagination.totalPages),
  );

  if (loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-700" />
        <p className="mt-5 text-base font-medium text-slate-700">
          Ranking properties against your preferences...
        </p>
        <p className="mt-2 text-sm text-slate-500">
          We’re weighting your budget, ROI, area, and location signals now.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-200 bg-red-50 px-8 py-16 text-center">
        <h3 className="text-2xl font-black text-red-900">
          Recommendation request failed
        </h3>
        <p className="mt-4 text-sm leading-7 text-red-700">{error}</p>
      </div>
    );
  }

  if (!hasAppliedPreferences) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <h3 className="text-2xl font-black text-slate-900">
          Build your recommendation brief
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
          Enter your preferred location or target metrics, then generate a
          ranked shortlist with clear reasons, penalties, and match scores.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <h3 className="text-2xl font-black text-slate-900">
          No ranked matches found
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
          We couldn’t find properties that fit this exact brief. Try widening
          your location radius, budget, or area target to surface more matches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Ranked results
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Your recommendation shortlist
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {getSummaryText(
                pagination.total || recommendations.length,
                appliedPreferences,
              )}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Best match
              </p>
              <p className="mt-2 text-2xl font-black text-center text-slate-900">
                {topResult?.matchPercentage ?? "--"}%
              </p>
            </div>
          </div>
        </div>

        {compareTopThree.length > 1 && (
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {compareTopThree.map((item, index) => (
              <div
                key={item.property.id}
                className={`rounded-3xl border p-4 ${
                  index === 0
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Rank #{index + 1}
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">
                    {item.matchPercentage}% Match
                  </span>
                </div>
                <p className="mt-3 text-base font-bold text-slate-900">
                  {item.property.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.rankingSummary}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {topResult && <TopRecommendationCard item={topResult} />}

      {otherResults.map((item, index) => (
        <RecommendationCard
          key={item.property.id}
          item={item}
          rank={(pagination.page - 1) * pagination.limit + index + 2}
        />
      ))}

      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={!pagination.hasPrev}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === pagination.page}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                pageNumber === pagination.page
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationResults;
