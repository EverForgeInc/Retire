export type GeocodedLocation = {
  providerPlaceId?: string;
  displayName?: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  source: string;
  retrievedAt: Date;
};

export type LocationSearchResult = Omit<GeocodedLocation, "latitude" | "longitude" | "retrievedAt"> & {
  latitude?: number;
  longitude?: number;
};

export type CostOfLivingResult = {
  category: string;
  amountLocal: number;
  amountUsd?: number;
  currency: string;
  source: string;
  retrievedAt: Date;
};

export interface GeocodingProvider {
  searchLocation(query: string): Promise<LocationSearchResult[]>;
  normalizeLocation(result: LocationSearchResult): LocationSearchResult;
  geocode(input: { city: string; state?: string; country: string; countryCode: string }): Promise<GeocodedLocation | null>;
}

export interface CostOfLivingProvider {
  getMonthlyCosts(input: { city: string; state?: string; country: string; countryCode: string }): Promise<CostOfLivingResult[]>;
}

/** No network provider is configured by default; unknown values stay unknown. */
export const unavailableGeocodingProvider: GeocodingProvider = {
  async searchLocation() {
    return [];
  },
  normalizeLocation(result) {
    return result;
  },
  async geocode() {
    return null;
  },
};

export const unavailableCostOfLivingProvider: CostOfLivingProvider = {
  async getMonthlyCosts() {
    return [];
  },
};