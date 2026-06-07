"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import CustomTable, { type ColumnDefinition } from "@/components/Table/Custom";
import {
  data as employeeData,
  type Employee,
  mockApi,
} from "@/components/Table/Custom/mockData";

// ── Mock server helpers ───────────────────────────────────────────────────────

function resolvePath(obj: any, path: string): unknown {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function applyFilterFn(
  value: unknown,
  filterValue: unknown,
  fn: string,
): boolean {
  const val = String(value ?? "").toLowerCase();
  const fv = String(filterValue ?? "").toLowerCase();
  switch (fn) {
    case "equals":
      return val === fv;
    case "contains":
      return val.includes(fv);
    case "startsWith":
      return val.startsWith(fv);
    case "endsWith":
      return val.endsWith(fv);
    case "notEquals":
      return val !== fv;
    case "greaterThan":
      return Number(value) > Number(filterValue);
    case "lessThan":
      return Number(value) < Number(filterValue);
    case "empty":
      return !value || val === "";
    case "notEmpty":
      return !!value && val !== "";
    default:
      return true;
  }
}

const GLOBAL_SEARCH_COLS: (keyof Employee)[] = [
  "firstName",
  "lastName",
  "email",
  "jobTitle",
];

// ── Column definitions ────────────────────────────────────────────────────────

const columns: ColumnDefinition<Employee>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    enableSorting: true,
    filterType: ["contains", "startsWith", "equals"],
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    enableSorting: true,
    filterType: ["contains", "startsWith", "equals"],
  },
  {
    accessorKey: "email",
    header: "Email",
    enableClickToCopy: true,
    filterType: ["contains", "equals"],
  },
  {
    accessorKey: "jobTitle",
    header: "Job Title",
    filterType: ["contains", "equals"],
  },
  {
    accessorKey: "salary",
    header: "Salary",
    enableSorting: true,
    filterType: ["greaterThan", "lessThan", "equals"],
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    filterType: undefined,
  },
];

// ── Offset Pagination Example ─────────────────────────────────────────────────

function OffsetExample() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<
    { id: string; value: unknown }[]
  >([]);
  const [columnFilterFns, setColumnFilterFns] = useState<
    Record<string, string>
  >({});
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([
    { id: "firstName", desc: false },
  ]);
  const [resetKey, setResetKey] = useState(0);

  const { data: result, isLoading, isFetching } = useQuery({
    queryKey: [
      "employees",
      pageIndex,
      pageSize,
      globalFilter,
      columnFilters,
      columnFilterFns,
      sorting,
    ],
    queryFn: async () => {
      let rows = employeeData.slice();

      if (globalFilter) {
        const lower = globalFilter.toLowerCase();
        rows = rows.filter((row) =>
          GLOBAL_SEARCH_COLS.some((col) =>
            String(row[col] ?? "")
              .toLowerCase()
              .includes(lower),
          ),
        );
      }

      for (const f of columnFilters) {
        if (f.value === undefined || f.value === null || f.value === "")
          continue;
        const fn = columnFilterFns[f.id] ?? "contains";
        rows = rows.filter((row) =>
          applyFilterFn(resolvePath(row, f.id), f.value, fn),
        );
      }

      if (sorting.length) {
        const { id, desc } = sorting[0];
        rows = [...rows].sort((a, b) => {
          const av = resolvePath(a, id);
          const bv = resolvePath(b, id);
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av ?? "").localeCompare(String(bv ?? ""));
          return desc ? -cmp : cmp;
        });
      }

      const rowCount = rows.length;
      const pageRows = rows.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize,
      );

      return mockApi({
        delay: 1400,
        payload: { rows: pageRows, rowCount },
        status: 200,
      });
    },
    placeholderData: (prev) => prev,
  });

  const handleReset = () => {
    setGlobalFilter("");
    setColumnFilters([]);
    setColumnFilterFns({});
    setSorting([{ id: "firstName", desc: false }]);
    setPageIndex(0);
    setResetKey((k) => k + 1);
  };

  return (
    <CustomTable
      key={resetKey}
      variant="headless"
      columns={columns}
      data={result?.data.rows ?? []}
      isLoading={isLoading}
      isFetching={isFetching}
      sort={{
        sortBy: sorting,
        onSortingChange: (next) => {
          setSorting(next);
          setPageIndex(0);
        },
      }}
      pagination={{
        pageIndex,
        pageSize,
        rowCount: result?.data.rowCount ?? 0,
        pageSizeOptions: [5, 10, 25],
        onPageChange: (newIndex, newSize) => {
          setPageIndex(newIndex);
          setPageSize(newSize);
        },
      }}
      globalFilter={{
        filterPlaceholder: "Search by name, email, job title...",
        keyColumns: ["firstName", "lastName", "email", "jobTitle"],
        onGlobalFilterChange: (value) => {
          setGlobalFilter(value);
          setPageIndex(0);
        },
      }}
      columnFilter={{
        showColumnFilters: true,
        filterTypes: ["contains", "equals", "startsWith"],
        onFiltersChange: (filters) => {
          setColumnFilters(filters);
          setPageIndex(0);
        },
        onFilterFnsChange: (fns) => {
          setColumnFilterFns(fns);
          setPageIndex(0);
        },
      }}
      reset={{ fn: handleReset }}
    />
  );
}

// ── Cursor Pagination Example ─────────────────────────────────────────────────

function CursorExample() {
  const [cursor, setCursor] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilter, setGlobalFilter] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const { data: result, isLoading, isFetching } = useQuery({
    queryKey: ["employees-cursor", cursor, pageSize, globalFilter],
    queryFn: async () => {
      let rows = employeeData.slice();

      if (globalFilter) {
        const lower = globalFilter.toLowerCase();
        rows = rows.filter((row) =>
          GLOBAL_SEARCH_COLS.some((col) =>
            String(row[col] ?? "")
              .toLowerCase()
              .includes(lower),
          ),
        );
      }

      const rowCount = rows.length;
      const pageRows = rows.slice(cursor, cursor + pageSize);
      const hasNext = cursor + pageSize < rowCount;
      const nextCursor = hasNext ? cursor + pageSize : undefined;

      return mockApi({
        delay: 600,
        payload: { rows: pageRows, hasNext, nextCursor, rowCount },
        status: 200,
      });
    },
    placeholderData: (prev) => prev,
  });

  return (
    <CustomTable<Employee>
      key={resetKey}
      variant="basic"
      columns={columns}
      data={result?.data.rows ?? []}
      isLoading={isLoading}
      isFetching={isFetching}
      pagination={{
        pageIndex,
        pageSize,
        rowCount: result?.data.rowCount ?? 0,
        hasNext: result?.data.hasNext,
        nextCursor: result?.data.nextCursor,
        pageSizeOptions: [5, 10, 25],
        showPageNumber: true,
        onPageChange: (newPageIndex, newPageSize, _hasNext, newCursor) => {
          setPageIndex(newPageIndex);
          setPageSize(newPageSize);
          setCursor(newCursor !== undefined ? Number(newCursor) : 0);
        },
      }}
      globalFilter={{
        filterPlaceholder: "Search employees...",
        onGlobalFilterChange: (value) => {
          setGlobalFilter(value);
          setCursor(0);
          setPageIndex(0);
        },
      }}
      reset={{
        fn: () => {
          setGlobalFilter("");
          setCursor(0);
          setPageIndex(0);
          setResetKey((k) => k + 1);
        },
      }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <MantineProvider>
      <div className="p-8">
        <h2 style={{ marginBottom: 16 }}>Offset Pagination</h2>
        <OffsetExample />
        <h2 style={{ marginTop: 48, marginBottom: 16 }}>Cursor Pagination</h2>
        <CursorExample />
      </div>
    </MantineProvider>
  );
}
