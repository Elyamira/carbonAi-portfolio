import { useEffect, useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnFiltersState, ExpandedState, FilterFn, SortingState } from "@tanstack/react-table";
import { BAND_ORDER, isExactDate } from "@/features/projects/model/record";
import type { Project } from "@/features/projects/model/portfolio";
import { recordFilterOf } from "@/features/projects/hooks/useFilters";
import { BandTag } from "@/features/projects/components/BandTag";
import { RatingText } from "@/features/projects/components/RatingText";

import { Recorded } from "./cells";

const searchProjects: FilterFn<Project> = (row, _columnId, value) => {
  const project = row.original;

  return [
    project.id,
    project.name,
    project.country,
    project.region,
    project.raw.registry,
    project.registry,
    project.type,
    project.raw.notes,
  ]
    .join(" ")
    .toLowerCase()
    .includes(String(value).trim().toLowerCase());
};

const columnHelper = createColumnHelper<Project>();

const columns = [
  columnHelper.accessor("name", {
    header: "Project (name, id)",
    sortingFn: "text",
  }),

  columnHelper.accessor((project) => project.raw.country, {
    id: "country",
    header: "Country",
  }),

  columnHelper.accessor("type", {
    header: "Type",
    filterFn: "equalsString",
    meta: { nowrap: true },
  }),

  // Sort and filter on the grouped registry,
  // display the registry as recorded.
  columnHelper.accessor("registry", {
    header: "Registry",
    cell: (cell) => cell.row.original.raw.registry,
    filterFn: "equalsString",
  }),

  columnHelper.accessor("vintageFrom", {
    id: "vintage",
    header: "Vintage",
    cell: (cell) => cell.row.original.raw.vintage,
    meta: { nowrap: true },
  }),

  // Sort on the parsed number, but only when the
  // volume participates in the calculations.
  columnHelper.accessor((project) => (project.counted ? project.tonnes : undefined), {
    id: "volume",
    header: "Volume",

    cell: (cell) => (
      <Recorded project={cell.row.original} field="volume">
        {cell.row.original.raw.volume}
      </Recorded>
    ),

    sortDescFirst: true,
    sortUndefined: "last",
    meta: {
      align: "right",
      nowrap: true,
    },
  }),

  // Prices are displayed exactly as recorded.
  // They cannot be meaningfully sorted because
  // currencies and price bases differ.
  columnHelper.accessor((project) => project.raw.price, {
    id: "price",
    header: "Price",

    cell: (cell) => (
      <Recorded project={cell.row.original} field="price">
        {cell.getValue()}
      </Recorded>
    ),

    enableSorting: false,
    meta: {
      align: "right",
      nowrap: true,
    },
  }),

  columnHelper.display({
    id: "rating",
    header: "Rating",

    cell: (cell) => <RatingText project={cell.row.original} />,

    meta: {
      align: "right",
      nowrap: true,
    },
  }),

  // A date with no day, or one that can be read
  // two ways, cannot safely be ordered against
  // exact dates.
  columnHelper.accessor((project) => (isExactDate(project.updated) ? project.updated.date.getTime() : undefined), {
    id: "updated",
    header: "Updated",

    cell: (cell) => (
      <Recorded project={cell.row.original} field="updated">
        {cell.row.original.raw.updated}
      </Recorded>
    ),

    sortUndefined: "last",
    meta: { nowrap: true },
  }),

  columnHelper.accessor("band", {
    header: "Rating band",

    cell: (cell) => <BandTag band={cell.getValue()} />,

    sortingFn: (rowA, rowB) => BAND_ORDER.indexOf(rowA.original.band) - BAND_ORDER.indexOf(rowB.original.band),

    filterFn: "equalsString",

    meta: {
      nowrap: true,
    },
  }),

  columnHelper.display({
    id: "details",
    header: "Details",
  }),

  // Filter-only columns, hidden through columnVisibility.
  columnHelper.accessor("region", {
    filterFn: "equalsString",
  }),

  columnHelper.accessor(recordFilterOf, { id: "record", filterFn: "equalsString" }),
];

interface Options {
  rows: Project[];
  columnFilters: ColumnFiltersState;
  globalFilter: string;
}

export function useProjectsTable({ rows, columnFilters, globalFilter }: Options) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "band",
      desc: false,
    },
    {
      id: "volume",
      desc: true,
    },
  ]);

  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Any change of filter or search closes open details.
  useEffect(() => {
    setExpanded({});
  }, [columnFilters, globalFilter]);
  // TanStack Table's returned instance is intentionally consumed by the table components.
  // eslint-disable-next-line react-hooks/incompatible-library
  return useReactTable({
    data: rows,
    columns,

    getRowId: (project) => project.id,

    state: {
      sorting,
      expanded,
      columnFilters,
      globalFilter,

      columnVisibility: {
        region: false,
        record: false,
      },
    },

    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    autoResetExpanded: false,
    globalFilterFn: searchProjects,
    autoResetPageIndex: false,
    getRowCanExpand: () => true,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });
}

export type ProjectsTableInstance = ReturnType<typeof useProjectsTable>;
