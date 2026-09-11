export type PriceLevelBenchmark = {
  countryCode: string;
  countryName: string;
  value: number;
  year: number;
  source: string;
  retrievedAt: Date;
  license: "CC BY 4.0";
};

type WorldBankObservation = {
  country?: { value?: string };
  countryiso3code?: string;
  date?: string;
  value?: number | null;
};

export function parseWorldBankPriceLevelResponse(
  payload: unknown,
  countryCode: string,
  source: string,
  retrievedAt = new Date(),
): PriceLevelBenchmark | null {
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) return null;
  const observation = (payload[1] as WorldBankObservation[]).find(
    (item) => typeof item.value === "number" && Number.isFinite(item.value),
  );
  if (!observation?.date || typeof observation.value !== "number") return null;
  const year = Number(observation.date);
  if (!Number.isInteger(year)) return null;
  return {
    countryCode: countryCode.toUpperCase(),
    countryName: observation.country?.value || countryCode.toUpperCase(),
    value: observation.value,
    year,
    source,
    retrievedAt,
    license: "CC BY 4.0",
  };
}

export async function getWorldBankPriceLevelBenchmark(countryCode: string) {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  const source = `https://api.worldbank.org/v2/country/${encodeURIComponent(code)}/indicator/PA.NUS.PRVT.PLI?format=json&per_page=10`;
  const response = await fetch(source, {
    headers: { "User-Agent": "MilitaryRetirementPlanner/0.1 (+https://github.com/EverForgeInc/Retire)" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return parseWorldBankPriceLevelResponse(payload, code, source);
}
