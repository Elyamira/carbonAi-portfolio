// What the numbers add up to. buildPortfolio is the one function the page calls: it reads every record, decides what
// counts under the unit choice, and aggregates.
import type { RawProject } from "@/features/projects/api/projectSchema";
import { readingNotes } from "./readingNotes";
import type { ReadingNote } from "./readingNotes";
import { BAND_ORDER, countedTonnes, parseRecord } from "./record";
import type { Band, ParsedDate, ParsedRating, ParsedRecord, ParsedVolume } from "./record";

/* ------------------------------------------------------------------ */
/* Arithmetic: generic, over anything that carries tonnes             */
/* ------------------------------------------------------------------ */

export interface Group {
  key: string;
  tonnes: number;
  /** The group's share of the total it was grouped against, from 0 to 1. */
  share: number;
  count: number;
}

export const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

export const byTonnesDescending = (first: { tonnes: number }, second: { tonnes: number }) => second.tonnes - first.tonnes;

/** Group items by a key, total their tonnes, and give each group its share of `total`. Largest group first. */
export function groupBy<Item extends { tonnes: number }>(items: readonly Item[], keyOf: (item: Item) => string, total: number): Group[] {
  const groups = new Map<string, Group>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key) ?? { key, tonnes: 0, share: 0, count: 0 };
    group.tonnes += item.tonnes;
    group.count += 1;
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({ ...group, share: total ? group.tonnes / total : 0 })).sort(byTonnesDescending);
}

/** The running total after each value: [0.3, 0.24, 0.2] -> [0.3, 0.54, 0.74]. */
export function runningTotals(values: readonly number[]): number[] {
  let running = 0;
  return values.map((value) => (running += value));
}

/* ------------------------------------------------------------------ */
/* The portfolio                                                      */
/* ------------------------------------------------------------------ */

export interface Project {
  /** The record exactly as it arrived. Every value on screen is shown from here. */
  raw: RawProject;
  id: string;
  name: string;
  country: string;
  /** Derived from country. A display grouping, not a new field. */
  region: string;
  type: string;
  /** Registry under its canonical name (VCS is shown as recorded, grouped as Verra). */
  registry: string;
  band: Band;
  volumeStatus: ParsedVolume["status"];
  /** The number the volume records, whether or not it counts. 0 when no number could be read. */
  tonnes: number;
  /** Whether the volume contributes to the portfolio's figures under the current unit choice. */
  counted: boolean;
  /** Share of the counted total, or null when the volume is not counted. */
  share: number | null;
  rating: ParsedRating;
  updated: ParsedDate;
  vintageFrom: number;
  readingNotes: ReadingNote[];
  /** True when any reading note needs attention. Decided here once; the table, the filter and the block all read it. */
  needsAttention: boolean;
}

export interface Portfolio {
  rows: Project[];
  /** Projects whose volume contributes to the figures, largest first. */
  counted: Project[];
  total: number;
  largest: Project | undefined;
  /** A project left out for having no unit that records a larger number than `largest`. Undefined when there is none. */
  largestExcluded: Project | undefined;
  top3Share: number;
  /** Counted projects, largest first, with the running share of the total. Feeds the concentration curve. */
  cumulative: { project: Project; share: number }[];
  byBand: Record<Band, Group>;
  /** Every project in each band, counted or not, largest first. Lets the legend say "0 of 1 counted". */
  projectsInBand: Record<Band, Project[]>;
  /** Projects with at least one note that needs attention, largest first. */
  needsAttention: Project[];
  unitlessCount: number;
  /** What the unitless volumes add if the analyst counts them as tCO2e. */
  unitlessTonnes: number;
}

function toProject(record: ParsedRecord, notes: ReadingNote[], counts: number | null, total: number): Project {
  const { raw, volume } = record;
  return {
    raw,
    id: raw.id,
    name: raw.name,
    country: raw.country,
    region: record.region,
    type: raw.type,
    registry: record.registry,
    band: record.band,
    volumeStatus: volume.status,
    tonnes: volume.status === "invalid" ? 0 : volume.tonnes,
    counted: counts !== null,
    share: counts !== null && total > 0 ? counts / total : null,
    rating: record.rating,
    updated: record.updated,
    vintageFrom: record.vintage.from,
    readingNotes: notes,
    needsAttention: notes.some((note) => note.requiresAttention),
  };
}

/** One entry per band, in band order, with an empty group for a band that has no counted volume. */
function perBand<Value>(valueOf: (band: Band) => Value): Record<Band, Value> {
  return Object.fromEntries(BAND_ORDER.map((band) => [band, valueOf(band)])) as Record<Band, Value>;
}

/**
 * The analytical view of the data, for one unit choice.
 * @param assumeUnit  false: volumes with no unit are left out of every figure.
 *                    true: they are counted as tCO2e. An invalid volume is never counted either way.
 */
export function buildPortfolio(data: readonly RawProject[], assumeUnit = false): Portfolio {
  // 1 and 2. Read every record once, and explain anything that needed interpreting. Independent of the unit choice.
  const records = data.map((raw) => {
    const record = parseRecord(raw);
    return { record, notes: readingNotes(record) };
  });

  // 3. Decide what counts, and total it.
  const counts = records.map(({ record }) => countedTonnes(record.volume, assumeUnit));
  const total = sum(counts.filter((tonnes): tonnes is number => tonnes !== null));
  const rows = records.map(({ record, notes }, index) => toProject(record, notes, counts[index], total));

  // 4. Aggregate. Everything about volume uses the counted projects only.
  const counted = rows.filter((project) => project.counted).sort(byTonnesDescending);
  const shares = runningTotals(counted.map((project) => project.share ?? 0));
  const bandGroups = groupBy(counted, (project) => project.band, total);
  const unitless = rows.filter((project) => project.volumeStatus === "unitless");

  return {
    rows,
    counted,
    total,
    largest: counted[0],
    largestExcluded: unitless
      .filter((project) => !project.counted && project.tonnes > (counted[0]?.tonnes ?? 0))
      .sort(byTonnesDescending)[0],
    top3Share: shares[Math.min(3, shares.length) - 1] ?? 0,
    cumulative: counted.map((project, index) => ({ project, share: shares[index] })),
    byBand: perBand((band) => bandGroups.find((group) => group.key === band) ?? { key: band, tonnes: 0, share: 0, count: 0 }),
    projectsInBand: perBand((band) => rows.filter((project) => project.band === band).sort(byTonnesDescending)),
    needsAttention: rows.filter((project) => project.needsAttention).sort(byTonnesDescending),
    unitlessCount: unitless.length,
    unitlessTonnes: sum(unitless.map((project) => project.tonnes)),
  };
}
