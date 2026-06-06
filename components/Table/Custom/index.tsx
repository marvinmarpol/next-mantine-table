"use client";

import { Fragment, ReactNode, useMemo, useState } from "react";
import {
  MantineReactTable,
  MRT_SortingState,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_FilterOption,
  type MRT_TableOptions,
} from "mantine-react-table";
import { Flex, MantineColor, Select, Text, TextInput } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCsv,
  IconEraser,
  IconPdf,
  IconRefresh,
} from "@tabler/icons-react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/UI/Button";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { ActionIcon } from "@/components/UI/ActionIcon";

type TableVariant = "basic" | "headless";

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

const defaultFilterTypes: FilterType[] = [
  "equals",
  "startsWith",
  "empty",
  "notEmpty",
];

type SortableColumn = {
  id: string;
  desc: boolean;
};

type ExportConfig<T> = {
  enabled: boolean;
  filename?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  color?: MantineColor;
  handleExportRows?: (rows: T[], type: "page" | "selected") => void;
  handleExportAll?: (data: T[]) => void;
  wrapper?: (children: ReactNode) => ReactNode;
};

export type ColumnDefinition<T> = {
  header: string;
  accessorKey: string;
  size?: number;
  accessorFn?: (originalRow: T) => unknown;
  Cell?: (opts: { row: T }) => ReactNode;
  filterType?: FilterType[];
  footer?: string;
  enablePinning?: boolean;
  enableSorting?: boolean;
  enableClickToCopy?: boolean;
};

export interface CustomTableProps<T extends Record<string, any>> {
  variant?: TableVariant;
  columns: ColumnDefinition<T>[];
  data: T[];
  isLoading?: boolean;
  sortBy?: SortableColumn[];
  noDataFallback?: ReactNode;
  reset?: {
    fn: () => void;
    children?: ReactNode;
  };
  refresh?: {
    fn: () => void;
    children?: ReactNode;
  };
  detailPanel?: {
    render: (row: T) => ReactNode;
    canExpand?: (row: T) => boolean;
  };
  error?: {
    isError: boolean;
    children: ReactNode;
    color?: MantineColor;
  };
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
    filterPlaceholder?: string;
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
  bottomToolbarActions?: ReactNode[];
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

export default function CustomTable<T extends Record<string, any>>({
  variant = "basic",
  columns,
  data,
  isLoading,
  noDataFallback,
  reset,
  refresh,
  error,
  detailPanel,
  sortBy,
  pagination,
  globalFilter,
  columnFilter,
  columnPinning,
  topToolbarActions,
  bottomToolbarActions,
  exportCSV,
  exportPDF,
}: CustomTableProps<T>) {
  const isCursorPagination =
    !!pagination &&
    (pagination.hasNext !== undefined || pagination.nextCursor !== undefined);
  const hasExport = !!(exportCSV?.enabled || exportPDF?.enabled);
  const hasColumnFilter =
    !!columnFilter || columns.some((c) => !!c.filterType?.length);
  const hasToolbarContent = !!(
    topToolbarActions?.length ||
    exportCSV?.enabled ||
    exportPDF?.enabled ||
    reset ||
    refresh
  );

  const defaultFilename = "table-export";
  const csvLeftIcon = exportCSV?.leftIcon ?? <IconCsv size={16} />;
  const csvRightIcon = exportCSV?.rightIcon;
  const csvFilename = exportCSV?.filename ?? defaultFilename;
  const pdfLeftIcon = exportPDF?.leftIcon ?? <IconPdf size={16} />;
  const pdfRightIcon = exportPDF?.rightIcon;
  const pdfFilename = exportPDF?.filename ?? defaultFilename;

  const defaultSearchPlaceholder = "Search...";
  const pageSizeOptions = pagination?.pageSizeOptions ?? [5, 10, 25, 50, 100];

  const [sorting, setSorting] = useState<MRT_SortingState>(
    (sortBy as MRT_SortingState) ?? [],
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
            filename: csvFilename.replaceAll(".csv", ""),
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
    doc.save(pdfFilename.replaceAll(".pdf", ""));
  };

  const mappedColumns = useMemo(
    () => mapColumns(columns),
    [columns, columnFilter?.filterTypes],
  );

  const renderExportButtons = (selectedRows: T[], pageRows: T[]): ReactNode => (
    <>
      {exportCSV?.enabled &&
        (() => {
          const csvButtons = (
            <>
              <Button
                variant="light"
                color={exportCSV.color}
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
                color={exportCSV.color}
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
                color={exportCSV.color}
                leftIcon={csvLeftIcon}
                rightIcon={csvRightIcon}
                disabled={selectedRows.length === 0}
                onClick={() =>
                  exportCSV.handleExportRows
                    ? exportCSV.handleExportRows(selectedRows, "selected")
                    : defaultCSVExport(selectedRows)
                }
              >
                Export Selected
              </Button>
            </>
          );
          return exportCSV.wrapper ? exportCSV.wrapper(csvButtons) : csvButtons;
        })()}
      {exportPDF?.enabled &&
        (() => {
          const pdfButtons = (
            <>
              <Button
                variant="light"
                color={exportPDF.color}
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
                color={exportPDF.color}
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
                color={exportPDF.color}
                leftIcon={pdfLeftIcon}
                rightIcon={pdfRightIcon}
                disabled={selectedRows.length === 0}
                onClick={() =>
                  exportPDF.handleExportRows
                    ? exportPDF.handleExportRows(selectedRows, "selected")
                    : defaultPDFExport(selectedRows)
                }
              >
                Export Selected
              </Button>
            </>
          );
          return exportPDF.wrapper ? exportPDF.wrapper(pdfButtons) : pdfButtons;
        })()}
    </>
  );

  const cursorNav = pagination && isCursorPagination && (
    <Flex gap={"lg"} align={"center"}>
      <Text size="sm">Rows per page:</Text>
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
      <Text size="sm">
        {pagination.pageIndex * pagination.pageSize + 1}–
        {pagination.pageIndex * pagination.pageSize + data.length}
      </Text>
      <Flex columnGap={"xs"}>
        <ActionIcon
          variant="secondary"
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
          <IconChevronLeft size={24} />
        </ActionIcon>
        <ActionIcon
          variant="secondary"
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
          <IconChevronRight size={24} />
        </ActionIcon>
      </Flex>
      <Text size="sm" px={5} c={"dimmed"}>
        Page {pagination.pageIndex + 1}
      </Text>
    </Flex>
  );

  const opts: MRT_TableOptions<T> = {
    columns: mappedColumns,
    data,
    layoutMode: "grid",

    state: {
      sorting,
      showAlertBanner: error?.isError ?? false,
      showProgressBars: isLoading,
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

    renderEmptyRowsFallback: () =>
      noDataFallback ?? (
        <div className="p-8 text-center text-[16px] italic text-gray-600">
          No data to display
        </div>
      ),

    ...(error && {
      mantineToolbarAlertBannerProps: {
        children: error.children,
        color: error.color ?? "error",
      },
    }),

    ...(detailPanel && {
      enableExpanding: true,
      renderDetailPanel: ({ row }) => detailPanel.render(row.original),
      ...(detailPanel.canExpand && {
        getRowCanExpand: (row) => detailPanel.canExpand!(row.original),
      }),
    }),

    ...(globalFilter && {
      mantineSearchTextInputProps: {
        placeholder: globalFilter.filterPlaceholder ?? defaultSearchPlaceholder,
      },
      onGlobalFilterChange: (updater: any) => {
        const value = typeof updater === "function" ? updater("") : updater;
        globalFilter.onGlobalFilterChange(String(value ?? ""));
      },
    }),

    ...(sortBy && {
      onSortingChange: setSorting,
    }),

    ...(pagination && {
      manualPagination: true,
      rowCount: pagination.rowCount,
      ...(!isCursorPagination && {
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

    renderTopToolbarCustomActions:
      variant !== "headless" && hasToolbarContent
        ? ({ table }) => {
            const selectedRows = table
              .getSelectedRowModel()
              .rows.map((r) => r.original as T);
            const pageRows = table
              .getRowModel()
              .rows.map((r) => r.original as T);

            return (
              <Flex gap="xs" align="center" wrap="wrap">
                {topToolbarActions?.map((node, i) => (
                  <Fragment key={i}>{node}</Fragment>
                ))}
                {reset && (
                  <ActionIcon variant="neutral" size="lg" onClick={reset.fn}>
                    {reset.children ?? <IconEraser size={16} />}
                  </ActionIcon>
                )}
                {refresh && (
                  <ActionIcon variant="neutral" size="lg" onClick={refresh.fn}>
                    {refresh.children ?? <IconRefresh size={16} />}
                  </ActionIcon>
                )}
                {renderExportButtons(selectedRows, pageRows)}
              </Flex>
            );
          }
        : undefined,

    ...(variant === "headless" && {
      enableTopToolbar: false,
      enableBottomToolbar: false,
    }),

    ...(isCursorPagination &&
      variant !== "headless" &&
      pagination && {
        renderBottomToolbar: () => (
          <Flex gap="xs" align="center" justify="flex-end" p="xs">
            {bottomToolbarActions?.map((node, i) => (
              <Fragment key={i}>{node}</Fragment>
            ))}
            {cursorNav}
          </Flex>
        ),
      }),
  };

  const table = useMantineReactTable(opts);

  if (variant === "headless") {
    const headlessHasTopContent = hasToolbarContent || !!globalFilter;
    const headlessHasBottomContent =
      isCursorPagination || !!bottomToolbarActions?.length;
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((r) => r.original as T);
    const pageRows = table.getRowModel().rows.map((r) => r.original as T);

    return (
      <>
        {headlessHasTopContent && (
          <Flex gap="xs" align="center" wrap="wrap" p="xs">
            {topToolbarActions?.map((node, i) => (
              <Fragment key={i}>{node}</Fragment>
            ))}
            {reset && (
              <ActionIcon variant="neutral" size="lg" onClick={reset.fn}>
                {reset.children ?? <IconEraser size={16} />}
              </ActionIcon>
            )}
            {refresh && (
              <ActionIcon variant="neutral" size="lg" onClick={refresh.fn}>
                {refresh.children ?? <IconRefresh size={16} />}
              </ActionIcon>
            )}
            {renderExportButtons(selectedRows, pageRows)}
            {globalFilter && (
              <TextInput
                placeholder={
                  globalFilter.filterPlaceholder ?? defaultSearchPlaceholder
                }
                onChange={(e) => table.setGlobalFilter(e.target.value)}
              />
            )}
          </Flex>
        )}
        <MantineReactTable table={table} />
        {headlessHasBottomContent && (
          <Flex gap="xs" align="center" justify="flex-end" p="xs">
            {bottomToolbarActions?.map((node, i) => (
              <Fragment key={i}>{node}</Fragment>
            ))}
            {cursorNav}
          </Flex>
        )}
      </>
    );
  }

  return <MantineReactTable table={table} />;
}
