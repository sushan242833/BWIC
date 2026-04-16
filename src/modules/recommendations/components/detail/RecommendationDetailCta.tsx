import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";

interface RecommendationDetailCtaProps {
  propertyId: string | number;
  onBack: () => void;
}

const RecommendationDetailCta = ({
  propertyId,
  onBack,
}: RecommendationDetailCtaProps) => {
  return (
    <section className="rounded-lg border border-[#dbe6ff] bg-white p-4 shadow-[0_20px_45px_rgba(19,27,46,0.06)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex justify-center rounded-lg border border-[#d6dcf0] px-6 py-3 font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-[#283044] transition hover:bg-[#f5f7ff]"
        >
          Back to Recommendations
        </button>
        <Link
          href={APP_ROUTES.contact}
          className="inline-flex justify-center rounded-lg bg-[#131b2e] px-6 py-3 font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#283044]"
        >
          Contact Specialist
        </Link>
        <Link
          href={APP_ROUTES.propertyDetail(propertyId)}
          className="inline-flex justify-center rounded-lg bg-[linear-gradient(135deg,#004ac6_0%,#4b41e1_100%)] px-6 py-3 font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-[#004ac6]/20 transition hover:opacity-95"
        >
          Open Standard Listing
        </Link>
      </div>
    </section>
  );
};

export default RecommendationDetailCta;
