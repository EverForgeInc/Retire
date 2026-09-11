import type { CostOfLivingProvider, CostOfLivingResult } from "./location";

const STATE_CODES: Record<string, string> = {
  alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar", california: "ca", colorado: "co",
  connecticut: "ct", delaware: "de", florida: "fl", georgia: "ga", hawaii: "hi", idaho: "id",
  illinois: "il", indiana: "in", iowa: "ia", kansas: "ks", kentucky: "ky", louisiana: "la",
  maine: "me", maryland: "md", massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms",
  missouri: "mo", montana: "mt", nebraska: "ne", nevada: "nv", "new hampshire": "nh", "new jersey": "nj",
  "new mexico": "nm", "new york": "ny", "north carolina": "nc", "north dakota": "nd", ohio: "oh",
  oklahoma: "ok", oregon: "or", pennsylvania: "pa", "rhode island": "ri", "south carolina": "sc",
  "south dakota": "sd", tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt", virginia: "va",
  washington: "wa", "west virginia": "wv", wisconsin: "wi", wyoming: "wy", "district of columbia": "dc",
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stateCode(value?: string) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (/^[a-z]{2}$/.test(normalized)) return normalized;
  return STATE_CODES[normalized] ?? null;
}

function decodeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function moneyAfter(text: string, label: RegExp) {
  const labelMatch = text.match(label);
  if (!labelMatch || labelMatch.index == null) return null;
  const start = labelMatch.index + labelMatch[0].length;
  const tail = text.slice(start, start + 120);
  const money = tail.match(/\$([0-9][0-9,]*(?:\.[0-9]+)?)/);
  if (!money) return null;
  const amount = Number(money[1].replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

export function parseCostOfLivingDataPage(html: string, sourceUrl: string, retrievedAt = new Date()): CostOfLivingResult[] {
  const text = decodeHtml(html);
  const categories: Array<[string, RegExp]> = [
    ["housing", /Rent\s+median rent|Median Rent(?:\s*\/\s*Month)?/i],
    ["groceries", /Groceries\s+national estimate|Food\s*&\s*Groceries/i],
    ["utilities", /Utilities\s+local estimate|Utilities/i],
    ["transportation", /Transportation\s+local gas prices|Transportation/i],
    ["estimated_total", /Estimated Total/i],
  ];

  return categories.flatMap(([category, label]) => {
    const amount = moneyAfter(text, label);
    if (amount == null) return [];
    return [{
      category,
      amountLocal: amount,
      amountUsd: amount,
      currency: "USD",
      source: sourceUrl,
      retrievedAt,
    }];
  });
}

export class CostOfLivingDataWebProvider implements CostOfLivingProvider {
  async getMonthlyCosts(input: { city: string; state?: string; country: string; countryCode: string }) {
    if (input.countryCode.toUpperCase() !== "US") return [];
    const region = stateCode(input.state);
    if (!region) return [];

    const sourceUrl = `https://costoflivingdata.com/cost-of-living/${region}/${slugify(input.city)}/`;
    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": "MilitaryRetirementPlanner/0.1 (+https://github.com/EverForgeInc/Retire)" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) return [];
    return parseCostOfLivingDataPage(await response.text(), sourceUrl);
  }
}

export const freeUsWebCostProvider = new CostOfLivingDataWebProvider();
