import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { rawProjectsSchema } from "@/features/projects/api/projectSchema";
import { readingNotes } from "./readingNotes";
import { parseRecord } from "./record";

const projects = rawProjectsSchema.parse(JSON.parse(readFileSync(resolve(process.cwd(), "public/data/projects.json"), "utf8")));
const notesFor = (id: string) => readingNotes(parseRecord(projects.find((project) => project.id === id)!));
const attentionFields = (id: string) =>
  notesFor(id)
    .filter((note) => note.requiresAttention)
    .map((note) => note.field)
    .sort();

describe("the attention rule: missing or ambiguous needs attention, written differently does not", () => {
  it("flags what is missing or ambiguous", () => {
    expect(attentionFields("PRJ-009")).toEqual(["updated", "volume"]); // no unit; 12/02/2023 reads two ways
    expect(attentionFields("PRJ-002")).toEqual(["price", "updated", "volume"]); // no unit, no currency, no day
    expect(attentionFields("PRJ-041")).toEqual(["rating", "volume"]); // no unit; "pending" is not a rating
  });

  it("notes what is complete but written differently, without flagging it", () => {
    const notes = notesFor("PRJ-021"); // "85 kt", "B+", "verra", "03/14/2024"
    expect(notes.map((note) => note.field)).toEqual(["volume", "rating", "updated", "registry"]);
    expect(notes.every((note) => !note.requiresAttention)).toBe(true);
  });

  it("notes a price that states its basis, without flagging it", () => {
    expect(notesFor("PRJ-007").find((note) => note.field === "price")).toMatchObject({ requiresAttention: false });
  });

  it("lists the notes that need attention first", () => {
    const flags = notesFor("PRJ-041").map((note) => note.requiresAttention);
    expect(flags).toEqual([...flags].sort((first, second) => Number(second) - Number(first)));
  });

  it("says nothing about a record in standard form", () => {
    expect(notesFor("PRJ-014")).toEqual([]);
  });
});
