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
  address: {
    country: string | null;
    countryCode: string | null;
    state: string | null;
    district: string | null;
    city: string | null;
    postalCode: string | null;
  };
}
