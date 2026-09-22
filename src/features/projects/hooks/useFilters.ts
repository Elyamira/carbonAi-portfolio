// Filter state lives in the URL, so a filtered view can be bookmarked, shared, and survives a reload.

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { ColumnFiltersState } from "@tanstack/react-table";
import type { Project } from "@/features/projects/model/portfolio";
import { BAND_LABEL } from "@/features/projects/model/record";
import type { Band } from "@/features/projects/model/record";

// TanStack Table reads it as controlled state; the charts and the toolbar write it through setFilter.
export const FILTER_IDS = ["type", "region", "registry", "band", "record"] as const;
export type FilterId = (typeof FILTER_IDS)[number];

export const FILTER_LABEL: Record<FilterId, string> = {
  type: "Project type",
  region: "Region",
  registry: "Registry",
  band: "Rating",
  record: "Records",
};

/**
 * The record filter splits the table in two: records with at least one note that needs attention, and the rest.
 * Every place that shows or matches this filter reads this one definition.
 */
export const RECORD_FILTER_LABEL = { "needs-attention": "Needs attention", "no-issues": "No issues" } as const;
export type RecordFilter = keyof typeof RECORD_FILTER_LABEL;
export const RECORD_FILTERS = Object.keys(RECORD_FILTER_LABEL) as RecordFilter[];
export const recordFilterOf = (project: Project): RecordFilter => (project.needsAttention ? "needs-attention" : "no-issues");

/** A filter's value as a person reads it. A link can carry a value that no longer exists, so unknown values are shown as written. */
export function describeFilterValue(id: FilterId, value: string): string {
  if (id === "band") return BAND_LABEL[value as Band] ?? value;
  if (id === "record") return RECORD_FILTER_LABEL[value as RecordFilter] ?? value;
  return value;
}

export function useFilters() {
  const [params, setParams] = useSearchParams();

  const columnFilters = useMemo<ColumnFiltersState>(
    () => FILTER_IDS.flatMap((id) => (params.get(id) ? [{ id, value: params.get(id) as string }] : [])),
    [params],
  );
  const query = params.get("q") ?? "";

  // replace: true keeps typing in the search box from filling the browser history.
  const write = useCallback(
    (key: string, value: string | null) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  return {
    columnFilters,
    query,
    valueOf: (id: FilterId) => params.get(id),
    setFilter: (id: FilterId, value: string | null) => write(id, value),
    toggleFilter: (id: FilterId, value: string) => write(id, params.get(id) === value ? null : value),
    setQuery: (text: string) => write("q", text.trim() === "" ? null : text),
    clearAll: () => setParams({}, { replace: true }),
    active: columnFilters.length > 0 || query !== "",
  };
}
