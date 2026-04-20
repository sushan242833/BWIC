import { API_ENDPOINTS } from "@/lib/api/routes";
import { getApiData, sendApiData } from "@/lib/api/client";
import type {
  FavoriteStatus,
  FavoritesList,
} from "@/modules/favorites/types";

export const getFavorites = () =>
  getApiData<FavoritesList>(API_ENDPOINTS.favorites.list);

export const checkFavoriteStatus = (propertyId: string | number) =>
  getApiData<FavoriteStatus>(API_ENDPOINTS.favorites.check(propertyId));

export const addFavorite = (propertyId: string | number) =>
  sendApiData<FavoriteStatus>(API_ENDPOINTS.favorites.add(propertyId), {
    method: "POST",
  });

export const removeFavorite = (propertyId: string | number) =>
  sendApiData<FavoriteStatus>(API_ENDPOINTS.favorites.remove(propertyId), {
    method: "DELETE",
  });
