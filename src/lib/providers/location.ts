export type GeocodedLocation = {
  latitude: number;
  longitude: number;
  source: string;
  retrievedAt: Date;
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
  geocode(input: { city: string; state?: string; country: string; countryCode: string }): Promise<GeocodedLocation | null>;
}

export interface CostOfLivingProvider {
  getMonthlyCosts(input: { city: string; state?: string; country: string; countryCode: string }): Promise<CostOfLivingResult[]>;
}

/** No network provider is configured by default; unknown values stay unknown. */
export const unavailableGeocodingProvider: GeocodingProvider = {
  async geocode() {
    return null;
  },
};

export const unavailableCostOfLivingProvider: CostOfLivingProvider = {
  async getMonthlyCosts() {
    return [];
  },
};