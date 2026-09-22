import "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

// TanStack Table types a column's `meta` as an empty interface and expects each project to extend it.
// These two fields are presentation hints the table renderer reads: right-align numbers, keep short values on one line.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "right";
    nowrap?: boolean;
  }
}
