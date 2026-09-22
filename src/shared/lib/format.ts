// Plain formatting helpers
const integerFormatter = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

/** 714800 -> "714,800" */
export const formatInteger = (value: number) => integerFormatter.format(Math.round(value));

/** 0.294 -> "29.4%" */
export const formatPercent = (ratio: number, fractionDigits = 1) => `${(ratio * 100).toFixed(fractionDigits)}%`;

/** A date as "2 Dec 2023", in UTC so it never shifts a day with the viewer's time zone. */
export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** pluralize(1, "project") -> "1 project"; pluralize(4, "project") -> "4 projects" */
export const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;
