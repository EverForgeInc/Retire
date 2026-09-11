export type InternationalPriceCategory = {
  category: "food" | "housing" | "health" | "transport" | "recreation" | "restaurants_hotels" | "overall";
  label: string;
  value: number;
  year: number;
  base: string;
  source: string;
  retrievedAt: Date;
  license: string;
};

const CATEGORY_CODES = [
  ["overall", "Actual individual consumption", "A01"],
  ["food", "Food and non-alcoholic beverages", "A0101"],
  ["housing", "Housing, water, electricity, gas and other fuels", "A0104"],
  ["health", "Health", "A0106"],
  ["transport", "Transport", "A0107"],
  ["recreation", "Recreation and culture", "A0109"],
  ["restaurants_hotels", "Restaurants and hotels", "A0111"],
] as const;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { current += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else current += char;
  }
  values.push(current);
  return values;
}

export function parseOecdPriceLevelCsv(
  csv: string,
  expectedCategory: typeof CATEGORY_CODES[number][0],
  expectedLabel: string,
  source: string,
  retrievedAt = new Date(),
): InternationalPriceCategory | null {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;
  const headers = parseCsvLine(lines[0]).map((item) => item.trim());
  const indexOf = (name: string) => headers.indexOf(name);
  const obsIndex = indexOf("OBS_VALUE");
  const timeIndex = indexOf("TIME_PERIOD");
  const baseIndex = indexOf("BASE_PER");
  if (obsIndex < 0 || timeIndex < 0) return null;

  const rows = lines.slice(1).map(parseCsvLine).map((row) => ({
    value: Number(row[obsIndex]),
    year: Number(row[timeIndex]),
    base: baseIndex >= 0 ? row[baseIndex] : "OECD",
  })).filter((row) => Number.isFinite(row.value) && Number.isInteger(row.year));
  if (rows.length === 0) return null;
  rows.sort((a, b) => b.year - a.year);
  const latest = rows[0];
  return {
    category: expectedCategory,
    label: expectedLabel,
    value: latest.value,
    year: latest.year,
    base: latest.base || "OECD",
    source,
    retrievedAt,
    license: "OECD Terms and Conditions (Data)",
  };
}

async function fetchCategory(countryCode: string, category: typeof CATEGORY_CODES[number]) {
  const [key, label, code] = category;
  const source = `https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PPP@DF_PPP_CPL,1.0/${encodeURIComponent(countryCode)}.A.PL.${code}..OECD?startPeriod=2022&dimensionAtObservation=AllDimensions`;
  try {
    const response = await fetch(source, {
      headers: {
        "User-Agent": "MilitaryRetirementPlanner/0.1 (+https://github.com/EverForgeInc/Retire)",
        Accept: "application/vnd.sdmx.data+csv;version=2.0.0, text/csv;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return parseOecdPriceLevelCsv(await response.text(), key, label, source);
  } catch {
    return null;
  }
}

export async function getOecdInternationalPriceCategories(countryCode: string) {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return [];
  const results = await Promise.all(CATEGORY_CODES.map((category) => fetchCategory(code, category)));
  return results.filter((result): result is InternationalPriceCategory => result !== null);
}

export const oecdInternationalCategoryCodes = CATEGORY_CODES;
