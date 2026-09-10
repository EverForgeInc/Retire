import type { LocationSearchResult } from "./location";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const COMMON_CURRENCIES: Record<string, string> = {
  US: "USD", CA: "CAD", MX: "MXN", GB: "GBP", IE: "EUR", FR: "EUR", DE: "EUR", ES: "EUR", IT: "EUR", PT: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
  JP: "JPY", KR: "KRW", PH: "PHP", ID: "IDR", SG: "SGD", MY: "MYR", TH: "THB", VN: "VND", AU: "AUD", NZ: "NZD", IN: "INR", AE: "AED",
};

export type SearchableLocationResult = LocationSearchResult & { currency?: string };

function getAddressPart(address: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    if (address[key]) return address[key];
  }
  return undefined;
}

export async function searchNominatimLocations(query: string): Promise<SearchableLocationResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "EverForgeInc-Retire/0.1 (retirement-planning application)",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Location provider returned ${response.status}`);
  }

  const raw = (await response.json()) as Array<{
    place_id?: number | string;
    display_name?: string;
    lat?: string;
    lon?: string;
    address?: Record<string, string>;
  }>;

  const results: SearchableLocationResult[] = [];

  for (const item of raw) {
    const address = item.address ?? {};
    const countryCode = (address.country_code ?? "").toUpperCase();
    const city = getAddressPart(address, ["city", "town", "village", "municipality", "county"]);
    const state = getAddressPart(address, ["state", "region", "province", "state_district"]);
    const country = address.country;
    const latitude = item.lat ? Number(item.lat) : undefined;
    const longitude = item.lon ? Number(item.lon) : undefined;

    if (!city || !country || countryCode.length !== 2 || latitude === undefined || longitude === undefined || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }

    results.push({
      providerPlaceId: item.place_id != null ? String(item.place_id) : undefined,
      displayName: item.display_name,
      city,
      state,
      country,
      countryCode,
      postalCode: address.postcode,
      latitude,
      longitude,
      source: "OpenStreetMap Nominatim",
      currency: COMMON_CURRENCIES[countryCode],
    });
  }

  return results;
}
