"use client";

import { Fragment, ReactNode, useMemo, useState } from "react";
import {
  MantineReactTable,
  MRT_SortingState,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_FilterOption,
  type MRT_TableOptions,
} from "mantine-react-table";
import {
  Box,
  Flex,
  MantineColor,
  Portal,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
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
  accessorFn?: (originalRow: T) => unknown;
  size?: number;
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
  isFetching?: boolean;
  sort?: {
    sortBy?: SortableColumn[];
    onSortingChange?: (sorting: SortableColumn[]) => void;
  };
  noDataFallback?: ReactNode;
  reset?: {
    fn: () => void;
    customIcon?: ReactNode;
  };
  refresh?: {
    fn: () => void;
    customIcon?: ReactNode;
  };
  detailPanel?: {
    render: (row: T) => ReactNode;
    canExpand?: (row: T) => boolean;
    expandOnRowClick?: boolean;
    hideExpandColumn?: boolean;
  };
  onRowClick?: (row: T) => void;
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
    showPageNumber?: boolean;
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
    position?: "left" | "right";
    onGlobalFilterChange?: (value: string) => void;
    keyColumns?: string[];
  };
  columnFilter?: {
    showColumnFilters?: boolean;
    filterTypes?: FilterType[];
    onFiltersChange?: (filters: { id: string; value: unknown }[]) => void;
    onFilterFnsChange?: (fns: Record<string, string>) => void;
  };
  columnPinning?: {
    left: string[];
    right: string[];
  };
  topToolbarActions?: ReactNode[];
  bottomToolbarActions?: ReactNode[];
  exportCSV?: ExportConfig<T>;
  exportPDF?: ExportConfig<T>;
  enableColumnActions?: boolean;
}

function mapColumns<T extends Record<string, any>>(
  cols: ColumnDefinition<T>[],
): MRT_ColumnDef<T>[] {
  return cols.map((col) => {
    const explicitFilterTypes = col.filterType;
    const filterTypes = explicitFilterTypes ?? defaultFilterTypes;
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
        enableColumnFilter: !!explicitFilterTypes?.length,
        enableColumnFilters: !!explicitFilterTypes?.length,
        enableColumnFilterModes: !!(
          explicitFilterTypes && explicitFilterTypes.length > 1
        ),
        ...(explicitFilterTypes &&
          explicitFilterTypes.length > 1 && {
            columnFilterModeOptions: explicitFilterTypes as MRT_FilterOption[],
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
  isFetching,
  noDataFallback,
  reset,
  refresh,
  error,
  detailPanel,
  sort,
  pagination,
  globalFilter,
  columnFilter,
  columnPinning,
  topToolbarActions,
  bottomToolbarActions,
  exportCSV,
  exportPDF,
  onRowClick,
  enableColumnActions,
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
  const csvLeftIcon = exportCSV?.leftIcon ?? <IconCsv />;
  const csvRightIcon = exportCSV?.rightIcon;
  const csvFilename = exportCSV?.filename ?? defaultFilename;
  const pdfLeftIcon = exportPDF?.leftIcon ?? <IconPdf />;
  const pdfRightIcon = exportPDF?.rightIcon;
  const pdfFilename = exportPDF?.filename ?? defaultFilename;

  const defaultSearchPlaceholder = "Search...";
  const pageSizeOptions = pagination?.pageSizeOptions ?? [5, 10, 25, 50, 100];

  const [sorting, setSorting] = useState<MRT_SortingState>(
    (sort?.sortBy as MRT_SortingState) ?? [],
  );

  const [cursorHistory, setCursorHistory] = useState<
    (string | number | undefined)[]
  >([]);

  const [columnFilters, setColumnFilters] = useState<
    { id: string; value: unknown }[]
  >([]);

  const [columnFilterFns, setColumnFilterFns] = useState<
    Record<string, string>
  >(() => {
    const globalFn = columnFilter?.filterTypes?.[0];
    const initial: Record<string, string> = {};
    for (const col of columns) {
      const hasExplicitType = "filterType" in col;
      if (hasExplicitType) {
        if (col.filterType?.length)
          initial[col.accessorKey] = col.filterType[0];
      } else if (globalFn) {
        initial[col.accessorKey] = globalFn;
      }
    }
    return initial;
  });

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");

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
    [exportCSV?.enabled, csvFilename],
  );

  const resolvePath = (obj: any, path: string): unknown =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const isPrimitive = (
    v: unknown,
  ): v is string | number | boolean | null | undefined =>
    v === null ||
    v === undefined ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean";

  const defaultCSVExport = (rows: T[]) => {
    if (!csvConfig) return;
    const flatRows = rows.map((row) => {
      const out: Record<string, string | number | boolean | null | undefined> =
        {};
      columns.forEach((col) => {
        const value = resolvePath(row, col.accessorKey);
        out[col.header] = isPrimitive(value) ? value : undefined;
      });
      return out;
    });
    const csv = generateCsv(csvConfig)(flatRows as any);
    download(csvConfig)(csv);
  };

  const defaultPDFExport = (rows: T[]) => {
    const doc = new jsPDF();
    const headers = columns.map((c) => c.header);
    const rowData = rows.map((row) =>
      columns.map((col) => {
        const value = resolvePath(row, col.accessorKey);
        return isPrimitive(value) ? String(value ?? "") : "";
      }),
    );
    autoTable(doc, { head: [headers], body: rowData });
    doc.save(pdfFilename.replaceAll(".pdf", ""));
  };

  const mappedColumns = useMemo(() => {
    const globalCount = columnFilter?.filterTypes?.length ?? 0;
    const cols = mapColumns(columns).map((col, i) => {
      if ("filterType" in columns[i] || !globalCount) return col;
      const globalTypes = columnFilter?.filterTypes;
      return {
        ...col,
        enableColumnFilter: true,
        enableColumnFilters: true,
        enableColumnFilterModes: globalCount > 1,
        ...(globalCount > 1 && {
          columnFilterModeOptions: globalTypes as MRT_FilterOption[],
        }),
      };
    });
    if (!globalFilter?.keyColumns) return cols;
    return cols.map((col) => ({
      ...col,
      enableGlobalFilter: globalFilter.keyColumns!.includes(
        col.accessorKey as string,
      ),
    }));
  }, [columns, columnFilter?.filterTypes, globalFilter?.keyColumns]);

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
          <IconChevronLeft />
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
          <IconChevronRight />
        </ActionIcon>
      </Flex>
      {pagination.showPageNumber && (
        <Text size="sm" mx={5} c={"dimmed"}>
          Page {pagination.pageIndex + 1}
        </Text>
      )}
    </Flex>
  );

  const opts: MRT_TableOptions<T> = {
    columns: mappedColumns,
    data,
    layoutMode: "grid",
    enableColumnActions: enableColumnActions ?? false,

    state: {
      sorting,
      isFullScreen,
      showAlertBanner: error?.isError ?? false,
      showProgressBars: isFetching ?? isLoading,
      isLoading: isFetching ?? isLoading ?? false,
      ...(globalFilter?.onGlobalFilterChange && {
        globalFilter: localGlobalFilter,
      }),
      ...(pagination && {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
      }),
      ...(columnFilter?.onFiltersChange && { columnFilters }),
      ...(columnFilter?.onFilterFnsChange && {
        columnFilterFns: columnFilterFns as Record<string, MRT_FilterOption>,
      }),
      ...(detailPanel?.hideExpandColumn && {
        columnVisibility: { "mrt-row-expand": false },
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

    manualSorting: !!sort?.onSortingChange,
    manualFiltering: !!columnFilter?.onFiltersChange,
    enableSorting:
      !!sort?.sortBy || columns.some((c) => c.enableSorting === true),
    enableRowSelection: hasExport,
    enableColumnFilters: hasColumnFilter && !isLoading,
    enableColumnFilterModes: hasColumnFilter,
    enableFilterMatchHighlighting: !columnFilter?.onFiltersChange,
    enableColumnPinning: !!columnPinning,
    enableGlobalFilter: !!globalFilter,
    positionGlobalFilter: globalFilter?.position,
    paginationDisplayMode: "pages",

    ...(columnFilter?.filterTypes?.length &&
      columnFilter?.filterTypes?.length > 1 && {
        columnFilterModeOptions: columnFilter.filterTypes,
      }),

    renderEmptyRowsFallback: () =>
      noDataFallback ?? (
        <div style={{ padding: 32, textAlign: "center" }}>
          <strong>No data to display.</strong>
          <br />
          Try adjusting your filters.
        </div>
      ),

    ...(error && {
      mantineToolbarAlertBannerProps: {
        children: error.children,
        color: error.color ?? "red",
      },
    }),

    ...(detailPanel && {
      enableExpanding: true,
      renderDetailPanel: ({ row }) => detailPanel.render(row.original),
      ...(detailPanel.canExpand && {
        getRowCanExpand: (row) => detailPanel.canExpand!(row.original),
        enableExpandAll: false,
        mantineExpandButtonProps: ({ row }) =>
          !row.getCanExpand()
            ? {
                style: {
                  visibility: "hidden" as const,
                  pointerEvents: "none" as const,
                },
              }
            : {},
      }),
    }),

    ...((detailPanel?.expandOnRowClick || !!onRowClick) && {
      mantineTableBodyRowProps: ({ row }) => ({
        onClick: (event: React.MouseEvent<HTMLTableRowElement>) => {
          if ((event.target as HTMLElement).closest("button")) return;
          if (detailPanel?.expandOnRowClick && (row.getCanExpand() || detailPanel?.canExpand === undefined)) {
            row.toggleExpanded();
            return;
          }
          onRowClick?.(row.original);
        },
        style: { cursor: "pointer" },
      }),
    }),

    ...(globalFilter && {
      mantineSearchTextInputProps: {
        placeholder: globalFilter.filterPlaceholder ?? defaultSearchPlaceholder,
      },
      ...(globalFilter.onGlobalFilterChange && {
        onGlobalFilterChange: (updater: any) => {
          const value =
            typeof updater === "function"
              ? updater(localGlobalFilter)
              : updater;
          setLocalGlobalFilter(String(value ?? ""));
          globalFilter.onGlobalFilterChange!(String(value ?? ""));
        },
      }),
    }),

    onSortingChange: (updater: any) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      sort?.onSortingChange?.(next as SortableColumn[]);
    },

    ...(columnFilter?.onFiltersChange && {
      onColumnFiltersChange: (updater: any) => {
        const next =
          typeof updater === "function" ? updater(columnFilters) : updater;
        setColumnFilters(next);
        columnFilter.onFiltersChange!(next);
      },
    }),

    ...(columnFilter?.onFilterFnsChange && {
      onColumnFilterFnsChange: (updater: any) => {
        const next =
          typeof updater === "function" ? updater(columnFilterFns) : updater;
        setColumnFilterFns(next);
        columnFilter.onFilterFnsChange!(next);
      },
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
                {reset &&
                  (reset.customIcon ?? (
                    <ActionIcon variant="neutral" size="lg" onClick={reset.fn}>
                      <IconEraser />
                    </ActionIcon>
                  ))}
                {refresh &&
                  (refresh.customIcon ?? (
                    <ActionIcon
                      variant="neutral"
                      size="lg"
                      onClick={refresh.fn}
                    >
                      <IconRefresh />
                    </ActionIcon>
                  ))}
                {renderExportButtons(selectedRows, pageRows)}
              </Flex>
            );
          }
        : undefined,

    ...(variant === "headless" && {
      enableTopToolbar: false,
      enableBottomToolbar: false,
    }),

    onIsFullScreenChange: (updater: any) => {
      const next =
        typeof updater === "function" ? updater(isFullScreen) : updater;
      setIsFullScreen(next);
    },

    ...(variant !== "headless" &&
      (isCursorPagination || !!bottomToolbarActions?.length) && {
        renderBottomToolbar: ({ table }) =>
          isFullScreen && isCursorPagination ? null : (
            <Flex gap="xs" align="center" justify="flex-end" p="xs">
              {bottomToolbarActions?.map((node, i) => (
                <Fragment key={i}>{node}</Fragment>
              ))}
              {isCursorPagination && cursorNav}
              {!isCursorPagination && pagination && (
                <MRT_TablePagination table={table} />
              )}
            </Flex>
          ),
      }),
  };

  const table = useMantineReactTable(opts);

  if (variant === "headless") {
    const headlessHasTopContent = hasToolbarContent || !!globalFilter;
    const headlessHasBottomContent =
      !!pagination || !!bottomToolbarActions?.length;
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((r) => r.original as T);
    const pageRows = table.getRowModel().rows.map((r) => r.original as T);

    return (
      <>
        {headlessHasTopContent && (
          <Flex gap="xs" align="center" wrap="wrap" py="xs">
            {globalFilter && globalFilter.position === "left" && (
              <TextInput
                mr="auto"
                value={table.getState().globalFilter ?? ""}
                placeholder={
                  globalFilter.filterPlaceholder ?? defaultSearchPlaceholder
                }
                onChange={(e) => table.setGlobalFilter(e.target.value)}
              />
            )}
            {topToolbarActions?.map((node, i) => (
              <Fragment key={i}>{node}</Fragment>
            ))}
            {reset &&
              (reset.customIcon ?? (
                <ActionIcon variant="neutral" size="lg" onClick={reset.fn}>
                  <IconEraser />
                </ActionIcon>
              ))}
            {refresh &&
              (refresh.customIcon ?? (
                <ActionIcon variant="neutral" size="lg" onClick={refresh.fn}>
                  <IconRefresh />
                </ActionIcon>
              ))}
            {renderExportButtons(selectedRows, pageRows)}
            {globalFilter && globalFilter.position !== "left" && (
              <TextInput
                ml="auto"
                value={table.getState().globalFilter ?? ""}
                placeholder={
                  globalFilter.filterPlaceholder ?? defaultSearchPlaceholder
                }
                onChange={(e) => table.setGlobalFilter(e.target.value)}
              />
            )}
          </Flex>
        )}
        {error?.isError && (
          <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
        )}
        <MantineReactTable table={table} />
        {headlessHasBottomContent && (
          <Flex gap="xs" align="center" justify="flex-end" p="xs">
            {bottomToolbarActions?.map((node, i) => (
              <Fragment key={i}>{node}</Fragment>
            ))}
            {pagination && !isCursorPagination && (
              <MRT_TablePagination table={table} />
            )}
            {cursorNav}
          </Flex>
        )}
      </>
    );
  }

  return (
    <>
      <MantineReactTable table={table} />
      {isFullScreen && isCursorPagination && (
        <Portal>
          <Box
            pos="fixed"
            bottom={0}
            left={0}
            right={0}
            p="xs"
            bg="var(--mantine-color-body)"
            style={{
              zIndex: 201,
              borderTop: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <Flex gap="xs" align="center" justify="flex-end">
              {bottomToolbarActions?.map((node, i) => (
                <Fragment key={i}>{node}</Fragment>
              ))}
              {cursorNav}
            </Flex>
          </Box>
        </Portal>
      )}
    </>
  );
}
