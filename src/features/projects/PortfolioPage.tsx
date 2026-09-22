import { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Chip, LinkButton } from "@/shared/ui/controls";
import { AnchorPanel, FootNote, Heading, PanelHead, SubText } from "@/shared/ui/layout";
import { Cards } from "./components/Cards";
import { ChartPanels } from "./components/ChartPanels";
import type { Dimension } from "./components/ChartPanels";
import { AttentionMark } from "./components/marks";
import { NeedsAttention } from "./components/NeedsAttention";
import { ProjectsToolbar } from "./components/ProjectsToolbar";
import { UnitChoice } from "./components/UnitChoice";
import { describeFilterValue, FILTER_IDS, FILTER_LABEL, useFilters } from "./hooks/useFilters";
import type { FilterId, RecordFilter } from "./hooks/useFilters";
import { useProjects } from "./hooks/useProjects";
import { buildPortfolio } from "./model/portfolio";
import { ProjectsTable } from "./table/ProjectsTable";
import { useProjectsTable } from "./table/useProjectsTable";

const Page = styled.main`
  display: grid;
  gap: ${({ theme }) => theme.space[5]};
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.space[6]} ${theme.space[5]} ${theme.space[7]}`};

  @media (max-width: 640px) {
    padding: ${({ theme }) => `${theme.space[5]} ${theme.space[4]} ${theme.space[7]}`};
  }
`;

const Intro = styled.div`
  h1 {
    margin-bottom: ${({ theme }) => theme.space[2]};
    font-size: ${({ theme }) => theme.fontSize.xl};
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.color.ink};
  }
  p {
    max-width: 72ch;
    font-size: ${({ theme }) => theme.fontSize.md};
  }
`;

/**
 * The wiring of the whole page. Read it top to bottom: data in, one portfolio object, then every card, chart and
 * the table derive from that object and from the filters in the URL.
 */
export function PortfolioPage() {
  const projects = useProjects();
  const filters = useFilters();
  const [assumeUnit, setAssumeUnit] = useState(false);
  const [dimension, setDimension] = useState<Dimension>("type");
  const tableSection = useRef<HTMLElement>(null);

  // One object for the whole page. Everything below recomputes when the data or the unit choice changes.
  const portfolio = useMemo(() => buildPortfolio(projects, assumeUnit), [projects, assumeUnit]);
  const selectOptions = useMemo(
    () => ({
      regions: [...new Set(portfolio.rows.map((project) => project.region))].sort(),
      types: [...new Set(portfolio.rows.map((project) => project.type))].sort(),
    }),
    [portfolio.rows],
  );
  const recordCounts = useMemo(
    () => ({ "needs-attention": portfolio.needsAttention.length, "no-issues": portfolio.rows.length - portfolio.needsAttention.length }),
    [portfolio],
  );

  const table = useProjectsTable({
    rows: portfolio.rows,
    columnFilters: filters.columnFilters,
    globalFilter: filters.query,
  });

  const scrollToTable = () => {
    const prefersLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tableSection.current?.scrollIntoView({ behavior: prefersLessMotion ? "auto" : "smooth", block: "start" });
  };
  const filterAndShow = (id: FilterId, value: string) => {
    filters.toggleFilter(id, value);
    scrollToTable();
  };

  const shownCount = table.getFilteredRowModel().rows.length;
  const activeFilterIds = FILTER_IDS.filter((id) => filters.valueOf(id) !== null);

  return (
    <Page>
      <Intro>
        <h1>Portfolio overview</h1>
        <p>
          Every figure comes straight from the recorded data. Numeric ratings are grouped at 60 and 80, and a value that cannot be added up
          as recorded is left out and listed under needs attention.
        </p>
      </Intro>

      <UnitChoice portfolio={portfolio} assumeUnit={assumeUnit} onChange={setAssumeUnit} />

      <Cards
        portfolio={portfolio}
        assumeUnit={assumeUnit}
        onShowProject={(projectId) => {
          // Searching by ID is the most direct way to bring one project up in the table.
          filters.clearAll();
          filters.setQuery(projectId);
          scrollToTable();
        }}
        onReviewGaps={() => document.getElementById("needs-attention")?.scrollIntoView({ block: "start" })}
      />

      <ChartPanels
        portfolio={portfolio}
        dimension={dimension}
        onDimensionChange={setDimension}
        selectedBand={filters.valueOf("band")}
        selectedGroup={filters.valueOf(dimension)}
        onPickBand={(band) => filterAndShow("band", band)}
        onPickGroup={(groupKey) => filters.toggleFilter(dimension, groupKey)}
      />

      <NeedsAttention
        portfolio={portfolio}
        assumeUnit={assumeUnit}
        onShowInTable={() => {
          filters.setFilter("record", "needs-attention" satisfies RecordFilter);
          scrollToTable();
        }}
      />

      <AnchorPanel ref={tableSection} id="projects" aria-labelledby="projects-heading">
        <PanelHead>
          <Heading id="projects-heading">All projects</Heading>
          <ProjectsToolbar
            query={filters.query}
            onQueryChange={filters.setQuery}
            valueOf={filters.valueOf}
            onFilterChange={filters.setFilter}
            regions={selectOptions.regions}
            types={selectOptions.types}
            recordCounts={recordCounts}
          />
        </PanelHead>
        <SubText aria-live="polite">
          <span id="count">
            Showing {shownCount} of {portfolio.rows.length}.
          </span>{" "}
          {activeFilterIds.map((id) => (
            <Chip
              key={id}
              type="button"
              onClick={() => filters.setFilter(id, null)}
              aria-label={`Remove filter ${FILTER_LABEL[id]}: ${describeFilterValue(id, filters.valueOf(id) ?? "")}`}
            >
              {FILTER_LABEL[id]}: {describeFilterValue(id, filters.valueOf(id) ?? "")} <span aria-hidden="true">×</span>
            </Chip>
          ))}
          {/* With no rows, the empty state below carries this action, so it is not offered twice. */}
          {filters.active && shownCount > 0 && (
            <LinkButton type="button" onClick={filters.clearAll}>
              Clear all filters
            </LinkButton>
          )}
          {!filters.active && "Values are shown exactly as recorded. Use Details for the analyst notes and for how each value was read."}
        </SubText>
        <ProjectsTable table={table} onClearFilters={filters.clearAll} />
        <FootNote>
          <AttentionMark aria-hidden="true" />A highlighted value is missing something (a unit, a currency or a day) or can be read two
          ways. Sorting never ranks a value that cannot be compared: an uncounted volume or an unclear date goes to the bottom, and price
          and rating cannot be sorted at all, because prices mix currencies and ratings mix two scales.
        </FootNote>
      </AnchorPanel>
    </Page>
  );
}
