"use client";

import { ReactNode, useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_FilterOption,
  type MRT_TableOptions,
} from "mantine-react-table";
import { Flex } from "@mantine/core";
import { mkConfig, generateCsv, download } from "export-to-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/UI/Button";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";

export type TableVariant = "basic" | "basic-export-csv" | "basic-export-pdf";
export type FilterType = "equals" | "startsWith" | "endsWith" | "contains";

export type ToolbarAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export type ColumnDefinition<T> = {
  accessorKey?: string;
  accessorFn?: (originalRow: T) => unknown;
  Cell?: (opts: { row: T }) => ReactNode;
  filterType?: FilterType[];
  header: string;
  footer?: string;
  size?: number;
  enableClickToCopy?: boolean;
  enablePinning?: boolean;
  enableSorting?: boolean;
};

export interface CustomTableProps<T extends Record<string, any>> {
  variant?: TableVariant;
  columns: ColumnDefinition<T>[];
  data: T[];
  isLoading?: boolean;
  sortBy?: { id: string; desc: boolean };
  pagination?: {
    pageIndex: number;
    pageSize: number;
    rowCount: number;
    nextCursor?: string | number;
    prevCursor?: string | number;
    onPageChange: (pageIndex: number, pageSize: number) => void;
  };
  globalFilter?: {
    filterType?: FilterType;
    filterPlaceholder: string;
    onGlobalFilterChange: (value: string) => void;
  };
  columnFilter?: {
    filterTypes?: FilterType[];
  };
  columnPinning?: {
    left: string[];
    right: string[];
  };
  topToolbarActions?: ToolbarAction[];
}

const VARIANT_EXPORT_MAP: Record<TableVariant, { csv: boolean; pdf: boolean }> =
  {
    basic: { csv: false, pdf: false },
    "basic-export-csv": { csv: true, pdf: false },
    "basic-export-pdf": { csv: false, pdf: true },
  };

function mapColumns<T extends Record<string, any>>(
  cols: ColumnDefinition<T>[],
  defaultFilterTypes?: FilterType[],
): MRT_ColumnDef<T>[] {
  return cols.map((col) => {
    const filterTypes = col.filterType ?? defaultFilterTypes;
    return {
      ...(col.accessorKey && {
        accessorKey: col.accessorKey as keyof T & string,
      }),
      ...(col.accessorFn && { accessorFn: col.accessorFn }),
      header: col.header,
      ...(col.footer !== undefined && { footer: col.footer }),
      ...(col.size !== undefined && { size: col.size }),
      ...(col.enableClickToCopy !== undefined && {
        enableClickToCopy: col.enableClickToCopy,
      }),
      ...(col.enablePinning !== undefined && {
        enableColumnPinning: col.enablePinning,
      }),
      ...(col.enableSorting !== undefined && {
        enableSorting: col.enableSorting,
      }),
      ...(filterTypes?.length && {
        filterFn: filterTypes[0] as MRT_FilterOption,
        ...(filterTypes.length > 1 && {
          columnFilterModeOptions: filterTypes as MRT_FilterOption[],
        }),
      }),
      ...(col.Cell && {
        Cell: (props: any) => col.Cell!({ row: props.row.original }),
      }),
    } as MRT_ColumnDef<T>;
  });
}

export default function CustomTable<T extends Record<string, any>>({
  variant = "basic",
  columns,
  data,
  isLoading,
  sortBy,
  pagination,
  globalFilter,
  columnFilter,
  columnPinning,
  topToolbarActions,
}: CustomTableProps<T>) {
  const { csv: enableCSV, pdf: enablePDF } = VARIANT_EXPORT_MAP[variant];
  const hasColumnFilter =
    !!columnFilter || columns.some((c) => !!c.filterType?.length);
  const hasToolbarContent = !!(
    topToolbarActions?.length ||
    enableCSV ||
    enablePDF
  );

  const csvConfig = useMemo(
    () =>
      enableCSV
        ? mkConfig({
            fieldSeparator: ",",
            decimalSeparator: ".",
            useKeysAsHeaders: true,
          })
        : null,
    [enableCSV],
  );

  const handleCSVExport = () => {
    if (!csvConfig) return;
    const csv = generateCsv(csvConfig)(data as any);
    download(csvConfig)(csv);
  };

  const handlePDFExport = () => {
    const doc = new jsPDF();
    const headers = columns.map((c) => c.header);
    const rows = data.map((row) => Object.values(row));
    autoTable(doc, { head: [headers], body: rows });
    doc.save("table-export.pdf");
  };

  const mappedColumns = useMemo(
    () => mapColumns(columns, columnFilter?.filterTypes),
    [columns, columnFilter?.filterTypes],
  );

  const opts: MRT_TableOptions<T> = {
    columns: mappedColumns,
    data,
    layoutMode: "grid",

    state: {
      isLoading: isLoading ?? false,
      ...(sortBy && { sorting: [{ id: sortBy.id, desc: sortBy.desc }] }),
      ...(pagination && {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
      }),
    },

    initialState: {
      showColumnFilters: true,
      ...(columnPinning && {
        columnPinning: { left: columnPinning.left, right: columnPinning.right },
      }),
    },

    // Sorting
    enableSorting: !!sortBy,

    // Pagination
    ...(pagination && {
      manualPagination: true,
      rowCount: pagination.rowCount,
      onPaginationChange: (updater) => {
        const current = {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        };

        console.log(current, updater)
        const next = typeof updater === "function" ? updater(current) : updater;
        pagination.onPageChange(next.pageIndex, next.pageSize);
      },
    }),

    // Global filter
    enableGlobalFilter: !!globalFilter,
    ...(globalFilter && {
      mantineSearchTextInputProps: {
        placeholder: globalFilter.filterPlaceholder,
      },
      onGlobalFilterChange: (updater: any) => {
        const value = typeof updater === "function" ? updater("") : updater;
        globalFilter.onGlobalFilterChange(String(value ?? ""));
      },
    }),

    // Column filter (hidden by default per spec §c, toggled via filter icon)
    enableColumnFilters: hasColumnFilter,
    enableColumnFilterModes: hasColumnFilter,

    // Column pinning
    enableColumnPinning: !!columnPinning,

    // Toolbar actions (spec §i: upper-right, purple theme)
    renderTopToolbarCustomActions: hasToolbarContent
      ? () => (
          <Flex gap="xs" align="center" wrap="wrap">
            {topToolbarActions?.map((action, i) => (
              <Button
                key={i}
                variant="primary"
                leftIcon={action.icon}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
            {enableCSV && (
              <Button
                variant="light"
                leftIcon={<IconDownload size={16} />}
                onClick={handleCSVExport}
              >
                Export CSV
              </Button>
            )}
            {enablePDF && (
              <Button
                variant="light"
                leftIcon={<IconDownload size={16} />}
                onClick={handlePDFExport}
              >
                Export PDF
              </Button>
            )}
          </Flex>
        )
      : undefined,
  };

  const table = useMantineReactTable(opts);

  return <MantineReactTable table={table} />;
}
