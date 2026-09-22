// What one record says. Each field's parsed type and parser, the lookups that group names, and parseRecord, which
// reads a whole record. Nothing here depends on the other records or on the unit choice.
import type { RawProject } from "@/features/projects/api/projectSchema";

/* ------------------------------------------------------------------ */
/* Volume: what a recorded volume can look like, and when it counts   */
/* ------------------------------------------------------------------ */

export type VolumeUnit = "tCO2e" | "kt";

/** How a recorded volume reads. A number with no unit is kept apart from one with a unit; nothing is guessed. */
export type ParsedVolume =
  { status: "valid"; tonnes: number; unit: VolumeUnit } | { status: "unitless"; tonnes: number } | { status: "invalid"; raw: string };

/** The units the data uses, and how many tonnes one of each is. Supporting a new unit is one line here. */
const UNITS: Record<string, { unit: VolumeUnit; tonnes: number }> = {
  tco2e: { unit: "tCO2e", tonnes: 1 },
  kt: { unit: "kt", tonnes: 1_000 },
};

/**
 * "120,000 tCO2e" -> valid, 120,000 t.   "85 kt" -> valid, 85,000 t.   "45000" or "12,400" -> unitless.
 * Anything else -> invalid, never guessed. Thousands separators are removed first, and every later step reads that
 * same cleaned text.
 */
export function parseVolume(raw: string): ParsedVolume {
  const match = raw
    .replace(/,/g, "")
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(\S*)$/);
  if (!match) return { status: "invalid", raw };

  const [, amountText, unitText] = match;
  const amount = Number(amountText);
  if (unitText === "") return { status: "unitless", tonnes: amount };

  const unit = UNITS[unitText.toLowerCase()];
  return unit ? { status: "valid", tonnes: amount * unit.tonnes, unit: unit.unit } : { status: "invalid", raw };
}

/**
 * The tonnes a volume contributes to the portfolio's figures, or null when it contributes nothing.
 * This is the only place the analyst's "count unitless volumes as tCO2e" choice is applied.
 */
export function countedTonnes(volume: ParsedVolume, assumeUnit: boolean): number | null {
  if (volume.status === "valid") return volume.tonnes;
  if (volume.status === "unitless" && assumeUnit) return volume.tonnes;
  return null;
}

/* ------------------------------------------------------------------ */
/* Rating: what a recorded rating can look like, and its band         */
/* ------------------------------------------------------------------ */

export type ParsedRating =
  { scale: "numeric"; score: number } | { scale: "letter"; grade: string } | { scale: "unrated"; recorded: string | null };

/**
 * 82 or "82" -> numeric.   "B+", "A-", "C" -> letter grade.   null, "" or "pending" -> unrated, keeping what was recorded.
 * Only text shaped like a grade counts as one, so a status word such as "pending" is never mistaken for a rating.
 */
export function parseRating(raw: RawProject["rating"]): ParsedRating {
  if (typeof raw === "number" && Number.isFinite(raw)) return { scale: "numeric", score: raw };

  const text = typeof raw === "string" ? raw.trim() : "";
  if (/^\d+(?:\.\d+)?$/.test(text)) return { scale: "numeric", score: Number(text) };
  if (/^[A-D][+-]?$/.test(text)) return { scale: "letter", grade: text };
  return { scale: "unrated", recorded: raw === null ? null : String(raw) };
}

/**
 * Rating bands, in display order. The type is derived from this list, so the two cannot drift apart.
 *
 * Only numeric ratings are banded: bucketing one 0 to 100 scale is a display choice the brief allows. Letter grades
 * are a group of their own, because the data does not say how letters relate to the numbers. Each band is named
 * after its range, not after a verdict: analysts rated a project 54, nobody rated it "high risk".
 */
export const BAND_ORDER = ["under60", "from60to79", "from80", "letter", "unrated"] as const;
export type Band = (typeof BAND_ORDER)[number];

export const BAND_LABEL: Record<Band, string> = {
  under60: "Rated below 60",
  from60to79: "Rated 60 to 79",
  from80: "Rated 80 or above",
  letter: "Letter grade",
  unrated: "Unrated",
};

export function bandOf(rating: ParsedRating): Band {
  if (rating.scale === "unrated") return "unrated";
  if (rating.scale === "letter") return "letter";
  if (rating.score >= 80) return "from80";
  if (rating.score >= 60) return "from60to79";
  return "under60";
}

/* ------------------------------------------------------------------ */
/* Updated: the date formats the data uses                            */
/* ------------------------------------------------------------------ */

export type DateFormat = "YYYY-MM-DD" | "MM/DD/YYYY" | "D Mon YYYY" | "Month YYYY" | "unrecognised";

export interface ParsedDate {
  /** Midnight UTC, so a date never shifts by a day with the viewer's time zone. Invalid when the format is unrecognised. */
  date: Date;
  precision: "day" | "month" | "unknown";
  format: DateFormat;
  /** True when the text reads as two different dates, such as 12/02/2023. */
  ambiguous: boolean;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const utcDate = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));
const monthNumber = (name: string) => MONTHS.indexOf(name.slice(0, 3).toLowerCase()) + 1;

/**
 * One reader per format, tried in order. Supporting a new format is one more reader in the list.
 * Slash dates are read month first, because the unambiguous ones in the data (03/14, 05/22) can only be read that way.
 */
const READERS: ((text: string) => ParsedDate | null)[] = [
  (text) => {
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return iso && { date: utcDate(+iso[1], +iso[2], +iso[3]), precision: "day", format: "YYYY-MM-DD", ambiguous: false };
  },
  (text) => {
    const slash = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!slash) return null;
    const month = +slash[1];
    const day = +slash[2];
    return {
      date: utcDate(+slash[3], month, day),
      precision: "day",
      format: "MM/DD/YYYY",
      ambiguous: month <= 12 && day <= 12 && month !== day,
    };
  },
  (text) => {
    const dayMonthYear = text.match(/^(\d{1,2}) ([A-Za-z]{3,}) (\d{4})$/);
    return (
      dayMonthYear && {
        date: utcDate(+dayMonthYear[3], monthNumber(dayMonthYear[2]), +dayMonthYear[1]),
        precision: "day",
        format: "D Mon YYYY",
        ambiguous: false,
      }
    );
  },
  (text) => {
    const monthYear = text.match(/^([A-Za-z]{3,}) (\d{4})$/);
    return (
      monthYear && {
        date: utcDate(+monthYear[2], monthNumber(monthYear[1]), 1),
        precision: "month",
        format: "Month YYYY",
        ambiguous: false,
      }
    );
  },
];

export function parseDate(raw: string): ParsedDate {
  for (const read of READERS) {
    const parsed = read(raw);
    if (parsed) return parsed;
  }
  return { date: new Date(NaN), precision: "unknown", format: "unrecognised", ambiguous: false };
}

/** Whether a date can be ordered against other dates: a known day, read only one way. */
export const isExactDate = (parsed: ParsedDate) => parsed.precision === "day" && !parsed.ambiguous;

/* ------------------------------------------------------------------ */
/* Vintage and price                                                  */
/* ------------------------------------------------------------------ */

export interface ParsedVintage {
  from: number;
  to: number;
  /** True for a two-digit year such as '23. */
  shorthand: boolean;
}

/** "2022" -> 2022 to 2022.   "2021-2023" -> 2021 to 2023.   "'23" -> 2023 to 2023, shorthand. */
export function parseVintage(raw: string): ParsedVintage {
  const range = raw.match(/^(\d{4})-(\d{4})$/);
  if (range) return { from: +range[1], to: +range[2], shorthand: false };

  const twoDigit = raw.match(/^'(\d{2})$/);
  if (twoDigit) return { from: 2000 + +twoDigit[1], to: 2000 + +twoDigit[1], shorthand: true };

  return { from: +raw, to: +raw, shorthand: false };
}

export interface ParsedPrice {
  /** The currency symbol the price states, or null when it states none. */
  currency: string | null;
  /** What the price is per, such as "tCO2e" in "€11.00/tCO2e", or null when it does not say. */
  basis: string | null;
}

export function parsePrice(raw: string): ParsedPrice {
  return {
    currency: raw.match(/[$£€]/)?.[0] ?? null,
    basis: raw.match(/\/\s*(\S+)\s*$/)?.[1] ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Lookups: display groupings, never new fields                       */
/* ------------------------------------------------------------------ */

const REGION_BY_COUNTRY: Record<string, string> = {
  Peru: "Latin America",
  Brazil: "Latin America",
  Chile: "Latin America",
  Mexico: "Latin America",
  Indonesia: "Asia",
  Bangladesh: "Asia",
  Nepal: "Asia",
  Ghana: "Africa",
  Zimbabwe: "Africa",
  Nigeria: "Africa",
  Senegal: "Africa",
  Iceland: "Europe",
  "United States": "North America",
};

/** Registries recorded under more than one name. VCS is Verra's programme; ACR is the American Carbon Registry. */
const REGISTRY_BY_ALIAS: Record<string, string> = {
  verra: "Verra",
  vcs: "Verra",
  "gold standard": "Gold Standard",
  acr: "ACR",
  "american carbon registry": "ACR",
  car: "CAR",
};

export const regionOf = (country: string): string => REGION_BY_COUNTRY[country] ?? "Other";

/** The registry's canonical name, or the name as recorded when it is not a known alias. */
export const registryOf = (recorded: string): string => REGISTRY_BY_ALIAS[recorded.trim().toLowerCase()] ?? recorded;

/* ------------------------------------------------------------------ */
/* A whole record                                                     */
/* ------------------------------------------------------------------ */

export interface ParsedRecord {
  /** The record exactly as it arrived. Never modified. */
  raw: RawProject;
  volume: ParsedVolume;
  price: ParsedPrice;
  rating: ParsedRating;
  band: Band;
  updated: ParsedDate;
  vintage: ParsedVintage;
  region: string;
  registry: string;
}

export function parseRecord(raw: RawProject): ParsedRecord {
  const rating = parseRating(raw.rating);
  return {
    raw,
    volume: parseVolume(raw.volume),
    price: parsePrice(raw.price),
    rating,
    band: bandOf(rating),
    updated: parseDate(raw.updated),
    vintage: parseVintage(raw.vintage),
    region: regionOf(raw.country),
    registry: registryOf(raw.registry),
  };
}
