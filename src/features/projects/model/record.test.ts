import { describe, expect, it } from "vitest";
import { bandOf, countedTonnes, isExactDate, parseDate, parsePrice, parseRating, parseVintage, parseVolume } from "./record";

describe("parseVolume", () => {
  it("reads tCO2e and kt", () => {
    expect(parseVolume("120,000 tCO2e")).toEqual({ status: "valid", tonnes: 120_000, unit: "tCO2e" });
    expect(parseVolume("85 kt")).toEqual({ status: "valid", tonnes: 85_000, unit: "kt" });
  });

  it("keeps a unitless volume apart, with or without a thousands separator", () => {
    expect(parseVolume("45000")).toEqual({ status: "unitless", tonnes: 45_000 });
    expect(parseVolume("12,400")).toEqual({ status: "unitless", tonnes: 12_400 });
    expect(parseVolume("210,000")).toEqual({ status: "unitless", tonnes: 210_000 });
  });

  it("rejects what it cannot read, instead of guessing", () => {
    expect(parseVolume("not a volume")).toEqual({ status: "invalid", raw: "not a volume" });
    expect(parseVolume("12 barrels")).toEqual({ status: "invalid", raw: "12 barrels" });
  });

  it("counts a unitless volume only when the analyst opts in, and an invalid one never", () => {
    expect(countedTonnes(parseVolume("45000"), false)).toBeNull();
    expect(countedTonnes(parseVolume("45000"), true)).toBe(45_000);
    expect(countedTonnes(parseVolume("junk"), true)).toBeNull();
  });
});

describe("parseRating and bandOf", () => {
  it("bands numeric ratings at 60 and 80", () => {
    expect(bandOf(parseRating(82))).toBe("from80");
    expect(bandOf(parseRating(80))).toBe("from80");
    expect(bandOf(parseRating(67))).toBe("from60to79");
    expect(bandOf(parseRating(54))).toBe("under60");
  });

  it("keeps letter grades apart, because the data does not define them", () => {
    expect(bandOf(parseRating("A-"))).toBe("letter");
    expect(bandOf(parseRating("C"))).toBe("letter");
  });

  it("treats a missing rating, or a word that is not a rating, as unrated", () => {
    expect(bandOf(parseRating(null))).toBe("unrated");
    expect(bandOf(parseRating(""))).toBe("unrated");
    expect(parseRating("pending")).toEqual({ scale: "unrated", recorded: "pending" });
  });
});

describe("parseDate", () => {
  it("reads the four formats in the data, at midnight UTC", () => {
    expect(parseDate("2024-03-01").date.toISOString()).toBe("2024-03-01T00:00:00.000Z");
    expect(parseDate("03/14/2024").date.toISOString()).toBe("2024-03-14T00:00:00.000Z");
    expect(parseDate("14 Mar 2024").date.toISOString()).toBe("2024-03-14T00:00:00.000Z");
    expect(parseDate("March 2024")).toMatchObject({ precision: "month", format: "Month YYYY" });
  });

  it("knows which dates can be ordered", () => {
    expect(isExactDate(parseDate("2024-03-01"))).toBe(true);
    expect(isExactDate(parseDate("12/02/2023"))).toBe(false); // 2 December or 12 February
    expect(isExactDate(parseDate("March 2024"))).toBe(false); // no day
    expect(isExactDate(parseDate("someday"))).toBe(false); // unreadable
  });
});

describe("parseVintage and parsePrice", () => {
  it("reads a year, a range and a two-digit year", () => {
    expect(parseVintage("2022")).toEqual({ from: 2022, to: 2022, shorthand: false });
    expect(parseVintage("2019-2021")).toEqual({ from: 2019, to: 2021, shorthand: false });
    expect(parseVintage("'23")).toEqual({ from: 2023, to: 2023, shorthand: true });
  });

  it("reads a price's currency and basis, and nothing more", () => {
    expect(parsePrice("€11.00/tCO2e")).toEqual({ currency: "€", basis: "tCO2e" });
    expect(parsePrice("18")).toEqual({ currency: null, basis: null });
  });
});
