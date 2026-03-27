import { BadgeCheck, BarChart3 } from "lucide-react";
import type {
  RecommendationItem,
  RecommendationPagination,
} from "@/modules/recommendations/types";
import RecommendationCard from "@/modules/recommendations/components/RecommendationCard";
import TopRecommendationCard from "@/modules/recommendations/components/TopRecommendationCard";

interface RecommendationResultsProps {
  recommendations: RecommendationItem[];
  pagination: RecommendationPagination;
  loading: boolean;
  error: string;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
}

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
  hasActiveFilters,
  onPageChange,
}: RecommendationResultsProps) => {
  const [topResult, ...otherResults] = recommendations;
  const pageNumbers = buildPageNumbers(
    pagination.page,
    Math.max(1, pagination.totalPages),
  );

  if (loading) {
    return (
      <div className="rounded-[28px] border border-[#dde3f5] bg-white px-8 py-16 text-center shadow-[0_24px_70px_rgba(19,27,46,0.06)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dbe1ff] border-t-[#004ac6]" />
        <p className="mt-5 font-auth-headline text-2xl font-bold text-[#131b2e]">
          Loading recommended properties
        </p>
        <p className="mt-3 font-auth-body text-sm leading-7 text-[#5b6275]">
          We&apos;re ranking the strongest opportunities available right now.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 px-8 py-16 text-center">
        <h3 className="font-auth-headline text-2xl font-bold text-red-900">
          Recommendation request failed
        </h3>
        <p className="mx-auto mt-4 max-w-2xl font-auth-body text-sm leading-7 text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section className="rounded-[32px] border-2 border-dashed border-[#d9def0] bg-[#eef1ff]/55 px-8 py-20 text-center">
        <div className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-sm">
          <BarChart3 className="h-14 w-14 text-[#c2cadf]" strokeWidth={1.8} />
        </div>

        <h3 className="font-auth-headline text-4xl font-bold text-[#131b2e]">
          {hasActiveFilters
            ? "No ranked matches found"
            : "No recommended properties available"}
        </h3>
        <p className="mx-auto mt-4 max-w-xl font-auth-body text-lg leading-8 text-[#5b6275]">
          {hasActiveFilters
            ? "We couldn't find properties that fit this brief. Try widening your location, budget, or area target to surface more matches."
            : "We're refreshing our latest picks. Please check back shortly for new recommendations."}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-10">
        {topResult && <TopRecommendationCard item={topResult} />}

        {otherResults.length > 0 && (
          <section className="space-y-8">
            <div className="space-y-2">
              <h2 className="font-auth-headline text-4xl font-bold text-[#131b2e]">
                Alternative Matches
              </h2>
              <p className="font-auth-body text-base text-[#5b6275]">
                Showing {pagination.total || recommendations.length} ranked
                opportunities from our current recommendation engine.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {otherResults.map((item, index) => (
                <RecommendationCard
                  key={item.property.id}
                  item={item}
                  rank={(pagination.page - 1) * pagination.limit + index + 2}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-[24px] border border-[#dde3f5] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(19,27,46,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <p className="font-auth-body text-sm text-[#5b6275]">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={!pagination.hasPrev}
            className="rounded-xl border border-[#d6dcf0] px-5 py-3 font-auth-body text-sm font-semibold text-[#283044] transition hover:bg-[#f5f7ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === pagination.page}
              className={`rounded-xl px-4 py-3 font-auth-body text-sm font-semibold transition ${
                pageNumber === pagination.page
                  ? "bg-[#004ac6] text-white"
                  : "border border-[#d6dcf0] text-[#283044] hover:bg-[#f5f7ff]"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="rounded-xl bg-[#131b2e] px-5 py-3 font-auth-body text-sm font-semibold text-white transition hover:bg-[#283044] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationResults;
