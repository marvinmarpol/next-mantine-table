"use client";

import { Fragment, ReactNode, useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_FilterOption,
  type MRT_TableOptions,
} from "mantine-react-table";
import { Flex, Select } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCsv,
  IconPdf,
} from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/UI/Button";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { ActionIcon } from "@/components/UI/ActionIcon";

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

type ExportConfig<T> = {
  enabled: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  handleExportRows?: (rows: T[], type: "page" | "selected") => void;
  handleExportAll?: (data: T[]) => void;
  filename: string;
  wrapper?: (buttons: ReactNode) => ReactNode;
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
  enableClickToCopy?: boolean;
  sortBy?: SortableColumn[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    rowCount: number;
    nextCursor?: string | number;
    hasNext?: boolean;
    pageSizeOptions?: number[];
    onPageChange: (
      pageIndex: number,
      pageSize: number,
      hasNext: boolean,
      nextCursor?: string | number,
    ) => void;
  };
  globalFilter?: {
    filterPlaceholder: string;
    onGlobalFilterChange: (value: string) => void;
  };
  columnFilter?: {
    showColumnFilters?: boolean;
    filterTypes?: FilterType[];
  };
  columnPinning?: {
    left: string[];
    right: string[];
  };
  topToolbarActions?: ReactNode[];
  exportCSV?: ExportConfig<T>;
  exportPDF?: ExportConfig<T>;
}

function mapColumns<T extends Record<string, any>>(
  cols: ColumnDefinition<T>[],
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

const defaultFilterTypes: FilterType[] = [
  "equals",
  "startsWith",
  "empty",
  "notEmpty",
];

export default function CustomTable<T extends Record<string, any>>({
  variant = "basic",
  columns,
  data,
  isLoading,
  enableClickToCopy,
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

  const csvLeftIcon = exportCSV?.leftIcon ?? <IconCsv size={16} />;
  const csvRightIcon = exportCSV?.rightIcon;
  const pdfLeftIcon = exportPDF?.leftIcon ?? <IconPdf size={16} />;
  const pdfRightIcon = exportPDF?.rightIcon;

  const pageSizeOptions = pagination?.pageSizeOptions ?? [10, 25, 50, 100];

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
            filename: `${exportCSV.filename}`,
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
    doc.save(`${exportPDF?.filename}`);
  };

  const mappedColumns = useMemo(
    () => mapColumns(columns),
    [columns, columnFilter?.filterTypes],
  );

  const opts: MRT_TableOptions<T> = {
    columns: mappedColumns,
    data,
    layoutMode: "grid",

    state: {
      isLoading: isLoading ?? false,
      ...(pagination && {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
      }),
    },

    initialState: {
      showColumnFilters: columnFilter?.showColumnFilters ?? false,
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
    enableClickToCopy,

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
          const pageRows = table.getRowModel().rows.map((r) => r.original as T);

          return (
            <Flex gap="xs" align="center" wrap="wrap">
              {topToolbarActions?.map((node, i) => (
                <Fragment key={i}>{node}</Fragment>
              ))}

              {exportCSV?.enabled &&
                (() => {
                  const csvButtons = (
                    <>
                      <Button
                        variant="light"
                        leftIcon={csvLeftIcon}
                        rightIcon={csvRightIcon}
                        onClick={() =>
                          exportCSV.handleExportAll
                            ? exportCSV.handleExportAll(data)
                            : defaultCSVExport(data)
                        }
                      >
                        Export All
                      </Button>
                      <Button
                        variant="light"
                        leftIcon={csvLeftIcon}
                        rightIcon={csvRightIcon}
                        onClick={() =>
                          exportCSV.handleExportRows
                            ? exportCSV.handleExportRows(pageRows, "page")
                            : defaultCSVExport(pageRows)
                        }
                      >
                        Export Page
                      </Button>
                      <Button
                        variant="light"
                        leftIcon={csvLeftIcon}
                        rightIcon={csvRightIcon}
                        disabled={selectedRows.length === 0}
                        onClick={() =>
                          exportCSV.handleExportRows
                            ? exportCSV.handleExportRows(
                                selectedRows,
                                "selected",
                              )
                            : defaultCSVExport(selectedRows)
                        }
                      >
                        Export Selected
                      </Button>
                    </>
                  );
                  return exportCSV.wrapper
                    ? exportCSV.wrapper(csvButtons)
                    : csvButtons;
                })()}

              {exportPDF?.enabled &&
                (() => {
                  const pdfButtons = (
                    <>
                      <Button
                        variant="light"
                        leftIcon={pdfLeftIcon}
                        rightIcon={pdfRightIcon}
                        onClick={() =>
                          exportPDF.handleExportAll
                            ? exportPDF.handleExportAll(data)
                            : defaultPDFExport(data)
                        }
                      >
                        Export All
                      </Button>
                      <Button
                        variant="light"
                        leftIcon={pdfLeftIcon}
                        rightIcon={pdfRightIcon}
                        onClick={() =>
                          exportPDF.handleExportRows
                            ? exportPDF.handleExportRows(pageRows, "page")
                            : defaultPDFExport(pageRows)
                        }
                      >
                        Export Page
                      </Button>
                      <Button
                        variant="light"
                        leftIcon={pdfLeftIcon}
                        rightIcon={pdfRightIcon}
                        disabled={selectedRows.length === 0}
                        onClick={() =>
                          exportPDF.handleExportRows
                            ? exportPDF.handleExportRows(
                                selectedRows,
                                "selected",
                              )
                            : defaultPDFExport(selectedRows)
                        }
                      >
                        Export Selected
                      </Button>
                    </>
                  );
                  return exportPDF.wrapper
                    ? exportPDF.wrapper(pdfButtons)
                    : pdfButtons;
                })()}
            </Flex>
          );
        }
      : undefined,

    ...(isCursorVariant &&
      pagination && {
        renderBottomToolbar: () => (
          <Flex gap="xs" align="center" justify="flex-end" p="xs">
            <Select
              size="sm"
              w={120}
              data={pageSizeOptions.map((n) => ({
                value: String(n),
                label: `${n}`,
              }))}
              value={String(pagination.pageSize)}
              onChange={(val) => {
                if (!val) return;
                const newSize = Number(val);
                setCursorHistory([]);
                pagination.onPageChange(
                  0,
                  newSize,
                  pagination.hasNext ?? false,
                  undefined,
                );
              }}
            />
            <ActionIcon
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
              <IconChevronLeft size={16} />
            </ActionIcon>
            <ActionIcon
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
              <IconChevronRight size={16} />
            </ActionIcon>
          </Flex>
        ),
      }),
  };

  const table = useMantineReactTable(opts);
  return <MantineReactTable table={table} />;
}
