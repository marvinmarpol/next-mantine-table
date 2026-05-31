"use client";

import { ReactNode, useMemo, useState } from "react";
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

type TableVariant = "basic" | "basic-cursor";
type FilterType =
  | "equals"
  | "startsWith"
  | "endsWith"
  | "contains"
  | "empty"
  | "notEmpty"
  | "notEquals"
  | "greaterThan"
  | "lessThan";

type SortableColumn = {
  id: string;
  desc: boolean;
};

type ToolbarAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

type ExportConfig<T> = {
  enabled: boolean;
  handleExportRows?: (rows: T[], type: "page" | "selected") => void;
  handleExportAll?: (data: T[]) => void;
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
  sortBy?: SortableColumn[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    rowCount: number;
    nextCursor?: string | number;
    hasNext?: boolean;
    onPageChange: (
      pageIndex: number,
      pageSize: number,
      hasNext: boolean,
      nextCursor?: string | number,
    ) => void;
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
  exportCSV?: ExportConfig<T>;
  exportPDF?: ExportConfig<T>;
}

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
  exportCSV,
  exportPDF,
}: CustomTableProps<T>) {
  const isCursorVariant = variant === "basic-cursor";
  const hasExport = !!(exportCSV?.enabled || exportPDF?.enabled);
  const hasColumnFilter =
    !!columnFilter || columns.some((c) => !!c.filterType?.length);
  const hasToolbarContent = !!(
    topToolbarActions?.length ||
    exportCSV?.enabled ||
    exportPDF?.enabled
  );

  const [cursorHistory, setCursorHistory] = useState<
    (string | number | undefined)[]
  >([]);

  const csvConfig = useMemo(
    () =>
      exportCSV?.enabled
        ? mkConfig({
            fieldSeparator: ",",
            decimalSeparator: ".",
            useKeysAsHeaders: true,
          })
        : null,
    [exportCSV?.enabled],
  );

  const defaultCSVExport = (rows: T[]) => {
    if (!csvConfig) return;
    const csv = generateCsv(csvConfig)(rows as any);
    download(csvConfig)(csv);
  };

  const defaultPDFExport = (rows: T[]) => {
    const doc = new jsPDF();
    const headers = columns.map((c) => c.header);
    const rowData = rows.map((row) => Object.values(row));
    autoTable(doc, { head: [headers], body: rowData });
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
      ...(sortBy && { sorting: sortBy }),
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
        columnPinning: {
          left: columnPinning.left,
          right: columnPinning.right,
        },
      }),
    },

    enableSorting: !!sortBy,
    enableRowSelection: hasExport,
    enableColumnFilters: hasColumnFilter,
    enableColumnFilterModes: hasColumnFilter,
    enableColumnPinning: !!columnPinning,
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

    ...(pagination && {
      manualPagination: true,
      rowCount: pagination.rowCount,
      ...(!isCursorVariant && {
        onPaginationChange: (updater) => {
          const current = {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
          };
          const next =
            typeof updater === "function" ? updater(current) : updater;
          pagination.onPageChange(
            next.pageIndex,
            next.pageSize,
            pagination.hasNext ?? false,
            pagination.nextCursor,
          );
        },
      }),
    }),

    renderTopToolbarCustomActions: hasToolbarContent
      ? ({ table }) => {
          const selectedRows = table
            .getSelectedRowModel()
            .rows.map((r) => r.original as T);
          const pageRows = table
            .getRowModel()
            .rows.map((r) => r.original as T);

          return (
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

              {exportCSV?.enabled && (
                <>
                  <Button
                    variant="light"
                    leftIcon={<IconDownload size={16} />}
                    onClick={() =>
                      exportCSV.handleExportAll
                        ? exportCSV.handleExportAll(data)
                        : defaultCSVExport(data)
                    }
                  >
                    Export All (CSV)
                  </Button>
                  <Button
                    variant="light"
                    leftIcon={<IconDownload size={16} />}
                    onClick={() =>
                      exportCSV.handleExportRows
                        ? exportCSV.handleExportRows(pageRows, "page")
                        : defaultCSVExport(pageRows)
                    }
                  >
                    Export Page (CSV)
                  </Button>
                  <Button
                    variant="light"
                    leftIcon={<IconDownload size={16} />}
                    disabled={selectedRows.length === 0}
                    onClick={() =>
                      exportCSV.handleExportRows
                        ? exportCSV.handleExportRows(selectedRows, "selected")
                        : defaultCSVExport(selectedRows)
                    }
                  >
                    Export Selected (CSV)
                  </Button>
                </>
              )}

              {exportPDF?.enabled && (
                <>
                  <Button
                    variant="light"
                    leftIcon={<IconDownload size={16} />}
                    onClick={() =>
                      exportPDF.handleExportAll
                        ? exportPDF.handleExportAll(data)
                        : defaultPDFExport(data)
                    }
                  >
                    Export All (PDF)
                  </Button>
                  <Button
                    variant="light"
                    leftIcon={<IconDownload size={16} />}
                    onClick={() =>
                      exportPDF.handleExportRows
                        ? exportPDF.handleExportRows(pageRows, "page")
                        : defaultPDFExport(pageRows)
                    }
                  >
                    Export Page (PDF)
                  </Button>
                  <Button
                    variant="light"
                    leftIcon={<IconDownload size={16} />}
                    disabled={selectedRows.length === 0}
                    onClick={() =>
                      exportPDF.handleExportRows
                        ? exportPDF.handleExportRows(selectedRows, "selected")
                        : defaultPDFExport(selectedRows)
                    }
                  >
                    Export Selected (PDF)
                  </Button>
                </>
              )}
            </Flex>
          );
        }
      : undefined,

    ...(isCursorVariant &&
      pagination && {
        renderBottomToolbar: () => (
          <Flex gap="xs" align="center" justify="flex-end" p="xs">
            <Button
              variant="light"
              disabled={pagination.pageIndex === 0}
              onClick={() => {
                const newHistory = cursorHistory.slice(0, -1);
                setCursorHistory(newHistory);
                pagination.onPageChange(
                  pagination.pageIndex - 1,
                  pagination.pageSize,
                  true,
                  newHistory[newHistory.length - 1],
                );
              }}
            >
              Previous
            </Button>
            <Button
              variant="light"
              disabled={!pagination.hasNext}
              onClick={() => {
                const newHistory = [...cursorHistory, pagination.nextCursor];
                setCursorHistory(newHistory);
                pagination.onPageChange(
                  pagination.pageIndex + 1,
                  pagination.pageSize,
                  pagination.hasNext ?? false,
                  pagination.nextCursor,
                );
              }}
            >
              Next
            </Button>
          </Flex>
        ),
      }),
  };

  const table = useMantineReactTable(opts);
  return <MantineReactTable table={table} />;
}
