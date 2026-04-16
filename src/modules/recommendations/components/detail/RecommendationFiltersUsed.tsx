import {
  buildMustHaveDisplayItems,
  buildPreferenceDisplayItems,
  type RecommendationPreferenceDisplayItem,
} from "@/modules/recommendations/detail-formatters";
import type { RecommendationParsedBriefMetadata } from "@/modules/recommendations/types";

interface RecommendationFiltersUsedProps {
  parsedBrief: RecommendationParsedBriefMetadata;
}

const PreferenceGrid = ({
  emptyMessage,
  items,
}: {
  emptyMessage: string;
  items: RecommendationPreferenceDisplayItem[];
}) => {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-[#e1e6f7] bg-[#fafbff] p-4">
        <p className="font-auth-body text-sm leading-7 text-[#5b6275]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-lg border border-[#e1e6f7] bg-[#fafbff] p-4"
        >
          <p className="font-auth-body text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b90a5]">
            {item.label}
          </p>
          <p className="mt-2 font-auth-headline text-lg font-bold text-[#131b2e]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

const RecommendationFiltersUsed = ({
  parsedBrief,
}: RecommendationFiltersUsedProps) => {
  const mustHaveItems = buildMustHaveDisplayItems(parsedBrief.appliedFilters);
  const preferenceItems = buildPreferenceDisplayItems(
    parsedBrief.appliedPreferences,
  );

  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_20px_45px_rgba(19,27,46,0.05)] sm:p-8">
      <div className="mb-7">
        <h2 className="font-auth-headline text-3xl font-bold text-[#131b2e]">
          Filters and Preferences Used
        </h2>
        <p className="mt-2 font-auth-body text-sm leading-7 text-[#5b6275]">
          These are the real request inputs the recommendation engine used to
          score this property.
        </p>
      </div>

      {parsedBrief.brief && (
        <div className="mb-6 rounded-lg border border-[#dbe6ff] bg-[#eef2ff] p-5">
          <p className="font-auth-body text-xs font-bold uppercase tracking-[0.16em] text-[#004ac6]">
            Original Brief
          </p>
          <p className="mt-2 font-auth-body text-base leading-8 text-[#283044]">
            &quot;{parsedBrief.brief}&quot;
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 font-auth-body text-sm font-bold uppercase tracking-[0.18em] text-[#737686]">
            Must-have Filters
          </h3>
          <PreferenceGrid
            items={mustHaveItems}
            emptyMessage="No strict must-have filters were returned for this request."
          />
        </div>

        <div>
          <h3 className="mb-4 font-auth-body text-sm font-bold uppercase tracking-[0.18em] text-[#737686]">
            Preferences
          </h3>
          <PreferenceGrid
            items={preferenceItems}
            emptyMessage="No soft preferences were returned for this request."
          />
        </div>
      </div>

      {parsedBrief.detectedEntities.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-4 font-auth-body text-sm font-bold uppercase tracking-[0.18em] text-[#737686]">
            Detected Signals
          </h3>
          <div className="flex flex-wrap gap-3">
            {parsedBrief.detectedEntities.map((entity) => (
              <span
                key={`${entity.type}-${entity.raw}`}
                className="rounded-full border border-[#d6defb] bg-white px-4 py-2 font-auth-body text-sm text-[#283044]"
              >
                {entity.type}: {String(entity.value)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default RecommendationFiltersUsed;
