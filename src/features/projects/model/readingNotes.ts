import type { ParsedRecord } from "./record";
import { formatDate, formatInteger } from "@/shared/lib/format";

export type ReadingNoteField = "volume" | "price" | "updated" | "rating" | "registry" | "notes";

export interface ReadingNote {
  field: ReadingNoteField;
  text: string;
  requiresAttention: boolean;
}

/*
 * The attention rule, in one sentence: a note needs attention when a value is missing something or can be read in
 * more than one way, so the source has to supply it or an analyst has to decide. A value that is complete but written
 * differently ("85 kt", "14 Mar 2024", "verra", "€11.00/tCO2e") gets a quiet note instead. Empty analyst notes are
 * commentary rather than a recorded value, so they are noted but never need attention.
 */
const attention = (field: ReadingNoteField, text: string): ReadingNote => ({ field, text, requiresAttention: true });
const quiet = (field: ReadingNoteField, text: string): ReadingNote => ({ field, text, requiresAttention: false });

function volumeNotes({ raw, volume }: ParsedRecord): ReadingNote[] {
  if (volume.status === "unitless") {
    return [
      attention("volume", `Volume "${raw.volume}" has no unit, so it is left out of the totals unless you choose to count it as tCO2e.`),
    ];
  }
  if (volume.status === "invalid") {
    return [attention("volume", `Volume "${raw.volume}" could not be interpreted safely, so it is left out of the totals.`)];
  }
  if (volume.unit === "kt") return [quiet("volume", `Volume "${raw.volume}" read as ${formatInteger(volume.tonnes)} tCO2e.`)];
  return [];
}

function priceNotes({ raw, price }: ParsedRecord): ReadingNote[] {
  const notes: ReadingNote[] = [];
  if (price.currency === null) notes.push(attention("price", `Price "${raw.price}" has no currency.`));
  if (price.basis !== null) {
    notes.push(
      quiet(
        "price",
        `Price "${raw.price}" says what it is per (${price.basis}). The other prices do not, so prices are shown as recorded and never compared.`,
      ),
    );
  }
  return notes;
}

function ratingNotes({ rating }: ParsedRecord): ReadingNote[] {
  if (rating.scale === "unrated") {
    return [
      attention(
        "rating",
        rating.recorded === null || rating.recorded.trim() === ""
          ? "No rating is recorded, so the project is not in any rating band."
          : `Rating "${rating.recorded}" is not a score or a grade, so the project is not in any rating band.`,
      ),
    ];
  }
  if (rating.scale === "letter") {
    return [
      quiet(
        "rating",
        `Rating "${rating.grade}" is a letter grade. The data does not say how letters relate to the numeric scores, so it is shown as recorded and not banded.`,
      ),
    ];
  }
  return [];
}

function dateNotes({ raw, updated }: ParsedRecord): ReadingNote[] {
  if (updated.precision === "unknown") return [attention("updated", `Date "${raw.updated}" could not be read.`)];
  if (updated.ambiguous)
    return [attention("updated", `Date "${raw.updated}" could be ${formatDate(updated.date)} or the day and month the other way round.`)];
  if (updated.precision === "month") return [attention("updated", `Date "${raw.updated}" has no day.`)];
  if (updated.format !== "YYYY-MM-DD") return [quiet("updated", `Date "${raw.updated}" read as ${formatDate(updated.date)}.`)];
  return [];
}

function registryNotes({ raw, registry }: ParsedRecord): ReadingNote[] {
  return registry !== raw.registry ? [quiet("registry", `Registry "${raw.registry}" grouped under ${registry}.`)] : [];
}

function analystNotes({ raw }: ParsedRecord): ReadingNote[] {
  return raw.notes.trim() === "" ? [quiet("notes", "No analyst notes are recorded.")] : [];
}

/** One writer per field, in the order the notes are shown. Explaining a new field is one more writer in the list. */
const WRITERS = [volumeNotes, priceNotes, ratingNotes, dateNotes, registryNotes, analystNotes];

export function readingNotes(record: ParsedRecord): ReadingNote[] {
  // Stable sort: notes that need attention first, otherwise in field order.
  return WRITERS.flatMap((write) => write(record)).sort(
    (first, second) => Number(second.requiresAttention) - Number(first.requiresAttention),
  );
}
