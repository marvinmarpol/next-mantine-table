import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { Badge } from "@mantine/core";
import { IconPlus, IconRefresh, IconUpload } from "@tabler/icons-react";
import CustomTable, { type ColumnDefinition } from "./index";
import { data as employeeData, type Employee } from "../advanced/makeData";

// ── Column definitions ────────────────────────────────────────────────────────

const basicColumns: ColumnDefinition<Employee>[] = [
  { accessorKey: "firstName", header: "First Name", enableSorting: true },
  { accessorKey: "lastName", header: "Last Name", enableSorting: true },
  { accessorKey: "email", header: "Email", enableClickToCopy: true },
  { accessorKey: "jobTitle", header: "Job Title" },
  { accessorKey: "salary", header: "Salary", enableSorting: true },
  { accessorKey: "startDate", header: "Start Date", enableSorting: true },
];

const filterableColumns: ColumnDefinition<Employee>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    filterType: ["contains", "startsWith", "equals"],
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    filterType: ["contains", "startsWith"],
  },
  {
    accessorKey: "email",
    header: "Email",
    filterType: ["contains", "equals"],
    enableClickToCopy: true,
  },
  {
    accessorKey: "jobTitle",
    header: "Job Title",
    filterType: ["equals", "endsWith"],
  },
  { accessorKey: "salary", header: "Salary", enableSorting: true },
  { accessorKey: "startDate", header: "Start Date", enableSorting: true },
];

const customCellColumns: ColumnDefinition<Employee>[] = [
  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "lastName", header: "Last Name" },
  { accessorKey: "email", header: "Email", enableClickToCopy: true },
  { accessorKey: "jobTitle", header: "Job Title" },
  {
    accessorKey: "salary",
    header: "Salary",
    enableSorting: true,
    Cell: ({ row }) => (
      <Badge
        color={
          row.salary >= 75_000
            ? "green"
            : row.salary >= 50_000
              ? "yellow"
              : "red"
        }
      >
        {row.salary.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        })}
      </Badge>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    Cell: ({ row }) => new Date(row.startDate).toLocaleDateString(),
  },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const EmployeeTable = CustomTable<Employee>;

const meta: Meta<typeof EmployeeTable> = {
  title: "Table/CustomTable",
  component: EmployeeTable,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmployeeTable>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Basic: Story = {
  args: {
    columns: basicColumns,
    data: employeeData.slice(0, 10),
  },
};

export const WithSorting: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    sortBy: [{ id: "salary", desc: true }],
  },
};

export const WithGlobalFilter: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    globalFilter: {
      filterPlaceholder: "Search by name, email, job title...",
      onGlobalFilterChange: fn(),
    },
  },
};

export const WithColumnFilter: Story = {
  args: {
    columns: filterableColumns,
    data: employeeData,
    columnFilter: { filterTypes: ["equals", "contains"] },
  },
};

export const WithColumnPinning: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    columnPinning: {
      left: ["firstName", "lastName"],
      right: [],
    },
    globalFilter: {
      filterPlaceholder: "Search employees...",
      onGlobalFilterChange: fn(),
    },
  },
};

export const WithPagination: Story = {
  render: () => {
    const [pageSize, setPageSize] = useState(5);
    const [pageIndex, setPageIndex] = useState(0);
    const start = pageIndex * pageSize;

    return (
      <EmployeeTable
        columns={basicColumns}
        data={employeeData.slice(start, start + pageSize)}
        pagination={{
          pageIndex,
          pageSize: pageSize,
          rowCount: employeeData.length,
          onPageChange: (newPageIndex, newPageSize) => {
            setPageIndex(newPageIndex);
            setPageSize(newPageSize);
          },
        }}
      />
    );
  },
};

export const WithCursorPagination: Story = {
  render: () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const start = pageIndex * pageSize;
    const pageData = employeeData.slice(start, start + pageSize);
    const hasNext = start + pageSize < employeeData.length;
    const nextCursor = hasNext ? `cursor_page_${pageIndex + 1}` : undefined;

    return (
      <EmployeeTable
        variant="basic-cursor"
        columns={basicColumns}
        data={pageData}
        pagination={{
          pageIndex,
          pageSize,
          rowCount: employeeData.length,
          hasNext,
          nextCursor,
          pageSizeOptions: [10, 25, 50],
          onPageChange: (newPageIndex, newPageSize) => {
            setPageIndex(newPageIndex);
            setPageSize(newPageSize);
          },
        }}
      />
    );
  },
};

export const WithToolbarActions: Story = {
  args: {
    columns: basicColumns,
    data: employeeData.slice(0, 10),
    topToolbarActions: [
      {
        actionProps: {
          label: "Add Employee",
          leftIcon: <IconPlus size={16} />,
        },
        onClick: fn(),
      },
      {
        actionProps: { label: "Upload", leftIcon: <IconUpload size={16} /> },
        onClick: fn(),
      },
      {
        actionProps: { label: "Refresh", leftIcon: <IconRefresh size={16} /> },
        onClick: fn(),
        disabled: true,
      },
    ],
  },
};

export const WithCSVExport: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    exportCSV: { enabled: true, filenameWithoutExtension: "employee-report" },
  },
};

export const WithPDFExport: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    exportPDF: { enabled: true, filenameWithoutExtension: "employee-report" },
  },
};

export const WithBothExports: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    exportCSV: { enabled: true, filenameWithoutExtension: "employee-report" },
    exportPDF: { enabled: true, filenameWithoutExtension: "employee-report" },
  },
};

export const WithCustomCell: Story = {
  args: {
    columns: customCellColumns,
    data: employeeData,
    sortBy: [{ id: "salary", desc: true }],
    globalFilter: {
      filterPlaceholder: "Search employees...",
      onGlobalFilterChange: fn(),
    },
  },
};

export const Loading: Story = {
  args: {
    columns: basicColumns,
    data: [],
    isLoading: true,
  },
};

export const AllFeatures: Story = {
  render: () => {
    const PAGE_SIZE = 5;
    const [pageIndex, setPageIndex] = useState(0);
    const start = pageIndex * PAGE_SIZE;

    return (
      <EmployeeTable
        columns={filterableColumns}
        data={employeeData.slice(start, start + PAGE_SIZE)}
        sortBy={[{ id: "firstName", desc: false }]}
        pagination={{
          pageIndex,
          pageSize: PAGE_SIZE,
          rowCount: employeeData.length,
          onPageChange: (newPageIndex) => setPageIndex(newPageIndex),
        }}
        globalFilter={{
          filterPlaceholder: "Search by name, email, job title...",
          onGlobalFilterChange: fn(),
        }}
        columnFilter={{ filterTypes: ["contains"] }}
        columnPinning={{ left: ["firstName"], right: [] }}
        topToolbarActions={[
          {
            actionProps: {
              label: "Add Employee",
              leftIcon: <IconPlus size={16} />,
            },
            onClick: fn(),
          },
          {
            actionProps: {
              label: "Refresh",
              leftIcon: <IconRefresh size={16} />,
            },
            onClick: fn(),
          },
        ]}
      />
    );
  },
};

export const AllVariants = {
  render: () => (
    <>
      {(["basic", "basic-cursor"] as const).map((variant) => (
        <div key={variant} style={{ marginBottom: 48 }}>
          <h3 style={{ fontFamily: "sans-serif", padding: "0 16px" }}>
            {variant}
          </h3>
          <CustomTable<Employee>
            variant={variant}
            columns={basicColumns}
            data={employeeData.slice(0, 5)}
          />
        </div>
      ))}
    </>
  ),
};
