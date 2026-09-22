import styled from "styled-components";
import { RECORD_FILTER_LABEL, RECORD_FILTERS } from "@/features/projects/hooks/useFilters";
import type { FilterId, RecordFilter } from "@/features/projects/hooks/useFilters";
import { Field, SearchInput, Segmented, Select } from "@/shared/ui/controls";

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.space[3]};
`;

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  valueOf: (id: FilterId) => string | null;
  onFilterChange: (id: FilterId, value: string | null) => void;
  regions: string[];
  types: string[];
  /** How many records fall on each side of the record filter, so the two halves are visibly the whole. */
  recordCounts: Record<RecordFilter, number>;
}

/** Every control has a visible label. All of them write the same filter state the charts write: the URL. */
export function ProjectsToolbar({ query, onQueryChange, valueOf, onFilterChange, regions, types, recordCounts }: Props) {
  const recordOptions = [
    { value: null, label: "All" },
    ...RECORD_FILTERS.map((value) => ({ value, label: `${RECORD_FILTER_LABEL[value]} (${recordCounts[value]})` })),
  ];
  return (
    <Bar>
      <Field>
        Search
        <SearchInput
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="ID, name, country or notes"
        />
      </Field>
      <Field>
        Region
        <Select
          value={valueOf("region") ?? ""}
          data-active={valueOf("region") !== null}
          onChange={(event) => onFilterChange("region", event.target.value || null)}
        >
          <option value="">All regions</option>
          {regions.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </Select>
      </Field>
      <Field>
        Project type
        <Select
          value={valueOf("type") ?? ""}
          data-active={valueOf("type") !== null}
          onChange={(event) => onFilterChange("type", event.target.value || null)}
        >
          <option value="">All types</option>
          {types.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </Select>
      </Field>
      <Field as="div">
        <span id="record-filter-label">Records</span>
        <Segmented role="group" aria-labelledby="record-filter-label">
          {recordOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={valueOf("record") === option.value}
              onClick={() => onFilterChange("record", option.value)}
            >
              {option.label}
            </button>
          ))}
        </Segmented>
      </Field>
    </Bar>
  );
}
