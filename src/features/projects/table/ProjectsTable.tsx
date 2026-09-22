import { Fragment } from "react";
import { flexRender } from "@tanstack/react-table";
import styled from "styled-components";
import logoBot from "@/shared/assets/carbonai-bot.png";
import { LinkButton, SmallButton } from "@/shared/ui/controls";
import { VisuallyHidden } from "@/shared/ui/layout";
import { ProjectDetails } from "./ProjectDetails";
import type { ProjectsTableInstance } from "./useProjectsTable";

/** The table scrolls sideways inside its own box on narrow screens. The page itself never does. */
const Scroll = styled.div`
  /* Positioned on purpose. The visually hidden labels inside the table are absolutely positioned; without a positioned
     ancestor they escape this box's clipping, and the ones in the last column make the whole page scroll sideways on a phone. */
  position: relative;
  overflow-x: auto;
  margin: 0 -${({ theme }) => theme.space[5]};
  padding: 0 ${({ theme }) => theme.space[5]};
`;

const Table = styled.table`
  width: 100%;
  min-width: 1040px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSize.sm};

  th,
  td {
    padding: 10px 6px;
    border-bottom: 1px solid ${({ theme }) => theme.color.lineSoft};
    text-align: left;
    vertical-align: top;
    font-weight: 400;
  }
  thead th {
    vertical-align: bottom;
    font-size: ${({ theme }) => theme.fontSize.xs};
    color: ${({ theme }) => theme.color.muted};
    white-space: nowrap;
  }
  thead th button {
    padding: 0;
    border: 0;
    background: none;
  }
  tbody th {
    min-width: 190px;
    font-weight: 600;
    color: ${({ theme }) => theme.color.ink};
  }
  tbody tr.main:hover {
    background: ${({ theme }) => theme.color.bg};
  }
  /* An open row and its details read as one block. */
  tbody tr.main[data-open="true"] > * {
    border-bottom-color: transparent;
    background: ${({ theme }) => theme.color.bg};
  }
  tbody tr[data-details] > td {
    padding: 0 8px;
    background: ${({ theme }) => theme.color.bg};
  }
  .right {
    text-align: right;
  }
  .nowrap {
    white-space: nowrap;
  }
`;

const ProjectId = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 400;
  color: ${({ theme }) => theme.color.muted};
`;

const Chevron = styled.span<{ $open: boolean }>`
  display: inline-block;
  margin-left: 6px;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  transition: transform 0.15s;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[5]};
  padding: ${({ theme }) => theme.space[5]};
  background: ${({ theme }) => theme.color.cream};
  border: 1px solid ${({ theme }) => theme.color.lineSoft};
  border-radius: ${({ theme }) => theme.radius.md};

  img {
    width: 72px;
    height: auto;
  }
  b {
    display: block;
    color: ${({ theme }) => theme.color.ink};
  }
`;

interface Props {
  table: ProjectsTableInstance;
  onClearFilters: () => void;
}

/** Renders the TanStack table instance. TanStack owns the state; this file owns every element. */
export function ProjectsTable({ table, onClearFilters }: Props) {
  const rows = table.getRowModel().rows;

  // The table opens sorted by rating band, then volume. A header click should replace that, not quietly re-sort
  // inside each band, which is what TanStack's default toggle does when the column is already the last of several sorts.
  const sortBy = (columnId: string, descendingFirst: boolean) => {
    const current = table.getState().sorting;
    const isOnlySort = current.length === 1 && current[0].id === columnId;
    table.setSorting([{ id: columnId, desc: isOnlySort ? !current[0].desc : descendingFirst }]);
  };

  if (rows.length === 0) {
    return (
      <EmptyState>
        <img src={logoBot} alt="carbon AI logo" />
        <p>
          <b>No projects match these filters.</b>
          Search looks at the ID, name, country, region, registry, type and notes.{" "}
          <LinkButton type="button" onClick={onClearFilters}>
            Clear all filters
          </LinkButton>
        </p>
      </EmptyState>
    );
  }

  return (
    <Scroll>
      <Table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const { column } = header;
                const label = flexRender(column.columnDef.header, header.getContext());
                const sorted = column.getIsSorted();
                // The Details column needs a header for screen readers, but not a visible one.
                const isUtilityColumn = column.id === "details";
                return (
                  <th
                    key={header.id}
                    scope="col"
                    className={column.columnDef.meta?.align === "right" ? "right" : undefined}
                    aria-sort={
                      column.getCanSort() ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined
                    }
                  >
                    {isUtilityColumn ? (
                      <VisuallyHidden>{label}</VisuallyHidden>
                    ) : column.getCanSort() ? (
                      <button type="button" onClick={() => sortBy(column.id, Boolean(column.columnDef.sortDescFirst))}>
                        {label}
                        <span aria-hidden="true">{sorted === "asc" ? " ▲" : sorted === "desc" ? " ▼" : ""}</span>
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row) => {
            const project = row.original;
            const isOpen = row.getIsExpanded();
            const detailsId = `details-${row.id}`;
            return (
              <Fragment key={row.id}>
                <tr className="main" data-open={isOpen}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    const className = [meta?.align === "right" ? "right" : "", meta?.nowrap ? "nowrap" : ""].join(" ").trim() || undefined;
                    if (cell.column.id === "name") {
                      // The row header. The ID sits under the name, so searching by ID makes visual sense.
                      return (
                        <th key={cell.id} scope="row">
                          {project.name}
                          <ProjectId>{project.id}</ProjectId>
                        </th>
                      );
                    }
                    if (cell.column.id === "details") {
                      return (
                        <td key={cell.id} className="nowrap">
                          <SmallButton
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={detailsId}
                            onClick={row.getToggleExpandedHandler()}
                          >
                            {isOpen ? "Hide" : "Details"}
                            <VisuallyHidden> for {project.name}</VisuallyHidden>
                            <Chevron $open={isOpen} aria-hidden="true">
                              ▾
                            </Chevron>
                          </SmallButton>
                        </td>
                      );
                    }
                    return (
                      <td key={cell.id} className={className}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
                {isOpen && (
                  <tr id={detailsId} data-details>
                    <td colSpan={row.getVisibleCells().length}>
                      <ProjectDetails project={project} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </Table>
    </Scroll>
  );
}
