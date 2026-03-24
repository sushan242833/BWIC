export interface LocationSuggestion {
  placeId: string;
  description: string;
}

export interface LocationPlaceDetails {
  id: string;
  primaryText: string;
  secondaryText: string | null;
  fullAddress: string;
  location: {
    lat: number;
    lng: number;
  };
}
