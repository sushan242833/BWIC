import { getApiData } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/routes";
import type {
  LocationPlaceDetails,
  LocationSuggestion,
} from "@/modules/locations/types";

export const LOCATION_AUTOCOMPLETE_MIN_CHARS = 2;
export const LOCATION_AUTOCOMPLETE_DEBOUNCE_MS = 300;

export const shouldFetchLocationSuggestions = (query: string): boolean =>
  query.trim().length >= LOCATION_AUTOCOMPLETE_MIN_CHARS;

export const getLocationSuggestions = (
  query: string,
): Promise<LocationSuggestion[]> => {
  const trimmedQuery = query.trim();
  if (!shouldFetchLocationSuggestions(trimmedQuery)) {
    return Promise.resolve([]);
  }

  return getApiData<LocationSuggestion[]>(
    `${API_ENDPOINTS.locations.autocomplete}?q=${encodeURIComponent(
      trimmedQuery,
    )}`,
  );
};

export const getLocationPlaceDetails = (
  placeId: string,
): Promise<LocationPlaceDetails> =>
  getApiData<LocationPlaceDetails>(
    `${API_ENDPOINTS.locations.placeDetails}?placeId=${encodeURIComponent(
      placeId,
    )}`,
  );
