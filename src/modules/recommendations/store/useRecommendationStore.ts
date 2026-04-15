import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_RECOMMENDATION_FORM_VALUES,
  DEFAULT_RECOMMENDATION_PAGINATION,
} from "@/modules/recommendations/constants";
import type { RecommendationWeights } from "@/modules/recommendation-settings/types";
import type {
  RecommendationItem,
  RecommendationPagination,
  RecommendationParsedBriefMetadata,
  RecommendationPlaceDetails,
  RecommendationPreferences,
} from "@/modules/recommendations/types";

type RecommendationRequestIdentity = {
  appliedValues: RecommendationPreferences;
  appliedPlaceDetails: RecommendationPlaceDetails | null;
  page: number;
  limit: number;
};

export const RECOMMENDATION_SESSION_STORAGE_KEY =
  "recommendation-session-store";

const getCurrentDocumentSessionId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const timeOrigin = window.performance.timeOrigin;
  if (typeof timeOrigin === "number" && Number.isFinite(timeOrigin)) {
    return String(timeOrigin);
  }

  return null;
};

export const shouldRestoreRecommendationSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const storedValue = window.sessionStorage.getItem(
    RECOMMENDATION_SESSION_STORAGE_KEY,
  );
  if (!storedValue) {
    return false;
  }

  try {
    const parsed = JSON.parse(storedValue) as {
      state?: { documentSessionId?: string | null };
    };

    return (
      parsed.state?.documentSessionId !== undefined &&
      parsed.state.documentSessionId === getCurrentDocumentSessionId()
    );
  } catch (error) {
    console.warn(
      "Failed to inspect persisted recommendation session state:",
      error,
    );
    return false;
  }
};

export const buildRecommendationRequestKey = ({
  appliedValues,
  appliedPlaceDetails,
  page,
  limit,
}: RecommendationRequestIdentity): string =>
  JSON.stringify({
    brief: appliedValues.brief.trim(),
    location: appliedValues.location.trim(),
    price: appliedValues.price.trim(),
    roi: appliedValues.roi.trim(),
    area: appliedValues.area.trim(),
    maxDistanceFromHighway: appliedValues.maxDistanceFromHighway.trim(),
    placeId: appliedPlaceDetails?.id ?? "",
    latitude: appliedPlaceDetails?.location.lat ?? null,
    longitude: appliedPlaceDetails?.location.lng ?? null,
    page,
    limit,
  });

export interface RecommendationStoreState {
  documentSessionId: string | null;
  formValues: RecommendationPreferences;
  appliedValues: RecommendationPreferences;
  selectedPlaceId: string;
  selectedPlaceDetails: RecommendationPlaceDetails | null;
  appliedPlaceDetails: RecommendationPlaceDetails | null;
  recommendations: RecommendationItem[];
  pagination: RecommendationPagination;
  summary: RecommendationParsedBriefMetadata | null;
  appliedWeights: RecommendationWeights | null;
  hasGenerated: boolean;
  lastGeneratedAt: number | null;
  lastCompletedRequestKey: string | null;
  scrollY: number;
  hasHydrated: boolean;
  setFormValue: <K extends keyof RecommendationPreferences>(
    field: K,
    value: RecommendationPreferences[K],
  ) => void;
  setFormValues: (values: Partial<RecommendationPreferences>) => void;
  setSelectedPlace: (
    placeId: string,
    details: RecommendationPlaceDetails | null,
  ) => void;
  clearSelectedPlace: () => void;
  applyRecommendationPayload: (payload: {
    appliedValues: RecommendationPreferences;
    appliedPlaceDetails: RecommendationPlaceDetails | null;
  }) => void;
  setResults: (payload: {
    recommendations: RecommendationItem[];
    pagination: RecommendationPagination;
    summary: RecommendationParsedBriefMetadata | null;
    appliedWeights: RecommendationWeights | null;
    requestKey: string;
  }) => void;
  setPage: (page: number) => void;
  setHasGenerated: (value: boolean) => void;
  setScrollY: (value: number) => void;
  setHasHydrated: (value: boolean) => void;
  resetRecommendationState: () => void;
}

const cloneDefaultFormValues = (): RecommendationPreferences => ({
  ...DEFAULT_RECOMMENDATION_FORM_VALUES,
});

const cloneDefaultPagination = (): RecommendationPagination => ({
  ...DEFAULT_RECOMMENDATION_PAGINATION,
});

const initialState = {
  documentSessionId: getCurrentDocumentSessionId(),
  formValues: cloneDefaultFormValues(),
  appliedValues: cloneDefaultFormValues(),
  selectedPlaceId: "",
  selectedPlaceDetails: null,
  appliedPlaceDetails: null,
  recommendations: [] as RecommendationItem[],
  pagination: cloneDefaultPagination(),
  summary: null as RecommendationParsedBriefMetadata | null,
  appliedWeights: null as RecommendationWeights | null,
  hasGenerated: false,
  lastGeneratedAt: null as number | null,
  lastCompletedRequestKey: null as string | null,
  scrollY: 0,
  hasHydrated: false,
};

export const useRecommendationStore = create<RecommendationStoreState>()(
  persist(
    (set) => ({
      ...initialState,
      setFormValue: (field, value) =>
        set((state) => ({
          formValues: {
            ...state.formValues,
            [field]: value,
          },
        })),
      setFormValues: (values) =>
        set((state) => ({
          formValues: {
            ...state.formValues,
            ...values,
          },
        })),
      setSelectedPlace: (placeId, details) =>
        set((state) => ({
          selectedPlaceId: placeId,
          selectedPlaceDetails: details,
          formValues: {
            ...state.formValues,
            location: details ? details.fullAddress : state.formValues.location,
          },
        })),
      clearSelectedPlace: () =>
        set({
          selectedPlaceId: "",
          selectedPlaceDetails: null,
        }),
      applyRecommendationPayload: ({ appliedValues, appliedPlaceDetails }) =>
        set((state) => ({
          appliedValues,
          appliedPlaceDetails,
          hasGenerated: true,
          lastGeneratedAt: Date.now(),
          lastCompletedRequestKey: null,
          recommendations: [],
          summary: null,
          appliedWeights: null,
          pagination: {
            ...cloneDefaultPagination(),
            limit: state.pagination.limit,
            page: 1,
          },
        })),
      setResults: ({
        recommendations,
        pagination,
        summary,
        appliedWeights,
        requestKey,
      }) =>
        set({
          recommendations,
          pagination,
          summary,
          appliedWeights,
          lastCompletedRequestKey: requestKey,
        }),
      setPage: (page) =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            page,
          },
        })),
      setHasGenerated: (value) =>
        set({
          hasGenerated: value,
        }),
      setScrollY: (value) =>
        set({
          scrollY: value,
        }),
      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),
      resetRecommendationState: () =>
        set({
          ...initialState,
          formValues: cloneDefaultFormValues(),
          appliedValues: cloneDefaultFormValues(),
          pagination: cloneDefaultPagination(),
          hasHydrated: true,
        }),
    }),
    {
      name: RECOMMENDATION_SESSION_STORAGE_KEY,
      skipHydration: true,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        documentSessionId: getCurrentDocumentSessionId(),
        formValues: state.formValues,
        appliedValues: state.appliedValues,
        selectedPlaceId: state.selectedPlaceId,
        selectedPlaceDetails: state.selectedPlaceDetails,
        appliedPlaceDetails: state.appliedPlaceDetails,
        recommendations: state.recommendations,
        pagination: state.pagination,
        summary: state.summary,
        appliedWeights: state.appliedWeights,
        hasGenerated: state.hasGenerated,
        lastGeneratedAt: state.lastGeneratedAt,
        lastCompletedRequestKey: state.lastCompletedRequestKey,
        scrollY: state.scrollY,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error(
            "Failed to restore recommendation session state:",
            error,
          );
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);

export const recommendationStore = useRecommendationStore;
