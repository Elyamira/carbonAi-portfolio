import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { rawProjectSchema, rawProjectsSchema } from "@/features/projects/api/projectSchema";
import type { RawProject } from "@/features/projects/api/projectSchema";
import { buildPortfolio } from "./portfolio";

const projects = rawProjectsSchema.parse(JSON.parse(readFileSync(resolve(process.cwd(), "public/data/projects.json"), "utf8")));

describe("project schema", () => {
  it("accepts the 14 source records", () => {
    expect(projects).toHaveLength(14);
  });

  it("rejects a record with a missing field", () => {
    expect(rawProjectSchema.safeParse({ id: "PRJ-001" }).success).toBe(false);
  });

  it("rejects a rating of the wrong type", () => {
    expect(rawProjectSchema.safeParse({ ...projects[0], rating: true }).success).toBe(false);
  });
});
describe("buildPortfolio", () => {
  it("never modifies the source records", () => {
    const before = JSON.stringify(projects);
    buildPortfolio(projects);
    buildPortfolio(projects, true);
    expect(JSON.stringify(projects)).toBe(before);
  });

  it("leaves unitless volumes out by default", () => {
    const portfolio = buildPortfolio(projects);
    expect(portfolio.total).toBe(401_800);
    expect(portfolio.counted).toHaveLength(7);
    expect(portfolio.largest?.id).toBe("PRJ-014");
    expect(portfolio.top3Share).toBeCloseTo(0.754, 3);
  });

  it("counts all seven unitless volumes when the analyst opts in", () => {
    const portfolio = buildPortfolio(projects, true);
    expect(portfolio.unitlessCount).toBe(7);
    expect(portfolio.unitlessTonnes).toBe(313_000);
    expect(portfolio.total).toBe(714_800);
    expect(portfolio.counted).toHaveLength(14);
    expect(portfolio.largest?.id).toBe("PRJ-009");
  });

  it("mentions a larger excluded project only while it is excluded", () => {
    expect(buildPortfolio(projects).largestExcluded?.id).toBe("PRJ-009");
    expect(buildPortfolio(projects, true).largestExcluded).toBeUndefined();
  });

  it("groups registry aliases", () => {
    const registries = new Set(buildPortfolio(projects).rows.map((project) => project.registry));
    expect([...registries].sort()).toEqual(["ACR", "CAR", "Gold Standard", "Verra"]);
  });

  it("puts every project in exactly one band, counted or not", () => {
    const { projectsInBand, byBand } = buildPortfolio(projects);
    expect(Object.values(projectsInBand).flat()).toHaveLength(14);
    expect(projectsInBand.under60.map((project) => project.id)).toEqual(["PRJ-009"]);
    expect(byBand.under60.count).toBe(0); // Kariba is rated 54 but its volume has no unit
  });

  it("lists the seven records that need attention, largest first", () => {
    expect(buildPortfolio(projects).needsAttention.map((project) => project.id)).toEqual([
      "PRJ-009",
      "PRJ-007",
      "PRJ-037",
      "PRJ-002",
      "PRJ-041",
      "PRJ-045",
      "PRJ-030",
    ]);
  });

  it("never counts an invalid volume, even when counting unitless ones", () => {
    const data: RawProject[] = [{ ...projects[0], id: "INVALID", volume: "not a number" }];
    const portfolio = buildPortfolio(data, true);
    expect(portfolio.total).toBe(0);
    expect(portfolio.counted).toHaveLength(0);
    expect(portfolio.largest).toBeUndefined();
    expect(portfolio.top3Share).toBe(0);
  });
});
