export interface TableColumn<T extends object = object> {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string | number;
  /** Allow sorting on this column (requires table-level enableSorting) */
  sortable?: boolean;
  /** Allow filtering on this column (requires table-level enableFiltering) */
  filterable?: boolean;
}

export interface TableProps<T extends object = object> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** Key in T to use as row identifier */
  rowKey: keyof T;
  /** Enable click-to-sort on column headers */
  enableSorting?: boolean;
  /** Enable per-column filter inputs below headers */
  enableFiltering?: boolean;
  /** Enable a global search box above the table */
  enableGlobalFilter?: boolean;
}