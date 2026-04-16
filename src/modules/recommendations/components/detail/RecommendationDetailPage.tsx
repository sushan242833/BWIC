import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { APP_ROUTES } from "@/config/routes";
import { getRecommendationDetail } from "@/modules/recommendations/api";
import {
  buildRecommendationQueryFromRouteQuery,
  getSafeReturnTo,
} from "@/modules/recommendations/navigation";
import type { RecommendationDetailData } from "@/modules/recommendations/types";
import RecommendationAppliedWeights from "@/modules/recommendations/components/detail/RecommendationAppliedWeights";
import RecommendationDetailCta from "@/modules/recommendations/components/detail/RecommendationDetailCta";
import RecommendationFiltersUsed from "@/modules/recommendations/components/detail/RecommendationFiltersUsed";
import RecommendationHero from "@/modules/recommendations/components/detail/RecommendationHero";
import RecommendationPropertyDetails from "@/modules/recommendations/components/detail/RecommendationPropertyDetails";
import RecommendationScoreBreakdown from "@/modules/recommendations/components/detail/RecommendationScoreBreakdown";
import RecommendationSummaryCard from "@/modules/recommendations/components/detail/RecommendationSummaryCard";
import RecommendationTradeOffs from "@/modules/recommendations/components/detail/RecommendationTradeOffs";
import RecommendationWhyMatched from "@/modules/recommendations/components/detail/RecommendationWhyMatched";

const getRoutePropertyId = (
  value: string | string[] | undefined,
): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
};

const LoadingState = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-[#faf8ff] px-6">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dbe1ff] border-t-[#004ac6]" />
      <p className="mt-5 font-auth-headline text-2xl font-bold text-[#131b2e]">
        Loading recommendation details
      </p>
      <p className="mt-2 font-auth-body text-sm text-[#5b6275]">
        Rebuilding the property analysis with the active recommendation context.
      </p>
    </div>
  </div>
);

const ErrorState = ({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) => (
  <div className="flex min-h-[60vh] items-center justify-center bg-[#faf8ff] px-6">
    <div className="max-w-lg rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <h1 className="font-auth-headline text-3xl font-bold text-red-950">
        Recommendation detail unavailable
      </h1>
      <p className="mt-4 font-auth-body text-sm leading-7 text-red-800">
        {message}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 rounded-lg bg-[#131b2e] px-6 py-3 font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#283044]"
      >
        Back to Recommendations
      </button>
    </div>
  </div>
);

const RecommendationDetailPage = () => {
  const router = useRouter();
  const [detail, setDetail] = useState<RecommendationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const propertyId = getRoutePropertyId(router.query.propertyId);
  const returnTo = getSafeReturnTo(router.query.returnTo);
  const recommendationQuery = useMemo(
    () =>
      buildRecommendationQueryFromRouteQuery(
        router.query as Record<string, string | string[] | undefined>,
      ),
    [router.asPath],
  );

  const handleBack = () => {
    if (returnTo) {
      void router.push(returnTo);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    void router.push(APP_ROUTES.recommendations);
  };

  useEffect(() => {
    if (!router.isReady || !propertyId) {
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getRecommendationDetail(
          propertyId,
          recommendationQuery,
        );

        if (cancelled) {
          return;
        }

        setDetail(response.data);
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch recommendation detail:", fetchError);
        setDetail(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load recommendation details.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [propertyId, recommendationQuery, router.isReady]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onBack={handleBack} />;
  }

  if (!detail) {
    return (
      <ErrorState
        message="The property or recommendation analysis could not be found."
        onBack={handleBack}
      />
    );
  }

  const { property, recommendation, meta } = detail;

  return (
    <div className="bg-[#faf8ff] font-auth-body text-[#131b2e]">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-12 lg:py-14">
        <nav className="mb-10 flex flex-wrap items-center gap-2 font-auth-body text-sm text-[#5b6275]">
          <Link href={APP_ROUTES.home} className="transition hover:text-[#004ac6]">
            Home
          </Link>
          <span>/</span>
          <button
            type="button"
            onClick={handleBack}
            className="transition hover:text-[#004ac6]"
          >
            Recommendations
          </button>
          <span>/</span>
          <span className="font-semibold text-[#131b2e]">{property.title}</span>
        </nav>

        <div className="space-y-12">
          <RecommendationHero
            property={property}
            recommendation={recommendation}
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <RecommendationSummaryCard
              recommendation={recommendation}
              meta={meta}
            />
            <RecommendationAppliedWeights meta={meta} />
          </div>

          <RecommendationPropertyDetails property={property} />

          <RecommendationScoreBreakdown
            breakdown={recommendation.scoreBreakdown}
            appliedWeights={meta.appliedWeights}
          />

          <div className="grid gap-10 lg:grid-cols-2">
            <RecommendationWhyMatched recommendation={recommendation} />
            <RecommendationTradeOffs recommendation={recommendation} />
          </div>

          <RecommendationFiltersUsed parsedBrief={meta.parsedBrief} />

          <RecommendationDetailCta
            propertyId={property.id}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetailPage;
