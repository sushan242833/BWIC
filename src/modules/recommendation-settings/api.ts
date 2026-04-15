import { getApiData, sendApiData } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/routes";
import type {
  RecommendationSettingsResponse,
  RecommendationSettingsUpdateResponse,
  UpdateRecommendationSettingsPayload,
} from "@/modules/recommendation-settings/types";

export const getRecommendationSettings = () =>
  getApiData<RecommendationSettingsResponse>(
    API_ENDPOINTS.user.recommendationSettings,
  );

export const updateRecommendationSettings = (
  payload: UpdateRecommendationSettingsPayload,
) =>
  sendApiData<RecommendationSettingsUpdateResponse>(
    API_ENDPOINTS.user.recommendationSettings,
    {
      method: "PUT",
      body: payload,
    },
  );

export const resetRecommendationSettings = () =>
  sendApiData<RecommendationSettingsResponse>(
    API_ENDPOINTS.user.recommendationSettings,
    {
      method: "DELETE",
    },
  );
