import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { Badge, Flex } from "@mantine/core";
import { IconPlus, IconRefresh, IconUpload } from "@tabler/icons-react";
import CustomTable, { type ColumnDefinition } from "./index";
import { Button } from "@/components/UI/Button";
import { data as employeeData, type Employee } from "../advanced/makeData";
import { ActionIcon } from "@/components/UI/ActionIcon";

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
    sort: { sortBy: [{ id: "salary", desc: true }] },
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
        variant="basic"
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
  render: () => (
    <EmployeeTable
      columns={basicColumns}
      data={employeeData.slice(0, 10)}
      topToolbarActions={[
        <Flex
          key="add"
          p={4}
          style={{ border: "1px dashed gray", borderRadius: 4 }}
        >
          <Button
            variant="success"
            leftIcon={<IconPlus size={16} />}
            onClick={fn()}
          >
            Add Employee
          </Button>
        </Flex>,
        <Button key="upload" variant="success" onClick={fn()}>
          <IconUpload size={16} />
        </Button>,
        <Button
          key="refresh"
          variant="success"
          leftIcon={<IconRefresh size={16} />}
          disabled
          onClick={fn()}
        >
          Refresh
        </Button>,
      ]}
    />
  ),
};

export const WithCSVExport: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    exportCSV: {
      enabled: true,
      filename: "employee-report.csv",
      leftIcon: <IconPlus size={16} />,
      wrapper: (btns) => (
        <Flex
          p={4}
          gap="xs"
          style={{ border: "1px dashed gray", borderRadius: 4 }}
        >
          {btns}
        </Flex>
      ),
    },
  },
};

export const WithPDFExport: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    exportPDF: { enabled: true, color: 'red', filename: "employee-reportes.pdf" },
  },
};

export const WithBothExports: Story = {
  args: {
    columns: basicColumns,
    data: employeeData,
    exportCSV: {
      enabled: true,
      wrapper: (btns) => (
        <Flex gap="xs" w="100%">
          {btns}
        </Flex>
      ),
    },
    exportPDF: { enabled: true },
  },
};

export const WithCustomCell: Story = {
  args: {
    columns: customCellColumns,
    data: employeeData,
    sort: { sortBy: [{ id: "salary", desc: true }] },
    globalFilter: {
      filterPlaceholder: "Search employees...",
      keyColumns: ["firstName"],
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
        sort={{ sortBy: [{ id: "firstName", desc: false }] }}
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
          <ActionIcon key="add" variant="success" size="lg" onClick={fn()}>
            <IconPlus size={16} />
          </ActionIcon>,
          <Button
            key="refresh"
            variant="success"
            leftIcon={<IconRefresh size={16} />}
            onClick={fn()}
          >
            Refresh
          </Button>,
        ]}
      />
    );
  },
};

export const AllVariants = {
  render: () => (
    <>
      {(["basic", "headless"] as const).map((variant) => (
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

export const WithResetRefresh: Story = {
  args: {
    columns: basicColumns,
    data: employeeData.slice(0, 10),
    reset: { fn: fn() },
    refresh: { fn: fn() },
  },
};

export const WithCustomIcon: Story = {
  render: () => (
    <EmployeeTable
      columns={basicColumns}
      data={employeeData.slice(0, 10)}
      reset={{
        fn: fn(),
        customIcon: (
          <Button variant="neutral" onClick={fn()}>
            Clear
          </Button>
        ),
      }}
      refresh={{
        fn: fn(),
        customIcon: (
          <Button variant="success" leftIcon={<IconRefresh size={16} />} onClick={fn()}>
            Reload
          </Button>
        ),
      }}
    />
  ),
};

export const WithDetailPanel: Story = {
  render: () => (
    <EmployeeTable
      columns={basicColumns}
      data={employeeData.slice(0, 10)}
      detailPanel={{
        render: (row) => (
          <div style={{ padding: 16 }}>
            <strong>Email:</strong> {row.email}
            <br />
            <strong>Job Title:</strong> {row.jobTitle}
            <br />
            <strong>Salary:</strong> ${row.salary.toLocaleString()}
          </div>
        ),
        //canExpand: (row) => row.salary >= 60_000,
        expandOnRowClick: true,
        hideExpandColumn: false,
      }}
    />
  ),
};

export const WithError: Story = {
  args: {
    columns: basicColumns,
    data: [],
    error: {
      isError: true,
      children: "Failed to load employee data. Please try again.",
      color: "red",
    },
  },
};

export const WithNoDataFallback: Story = {
  args: {
    columns: basicColumns,
    data: [],
    noDataFallback: (
      <div style={{ padding: 32, textAlign: "center", color: "#888" }}>
        <strong>No employees found.</strong>
        <br />
        Try adjusting your filters.
      </div>
    ),
  },
};

export const WithBottomToolbarActions: Story = {
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
          pageSize,
          rowCount: employeeData.length,
          onPageChange: (newPageIndex, newPageSize) => {
            setPageIndex(newPageIndex);
            setPageSize(newPageSize);
          },
        }}
        bottomToolbarActions={[
          <Button key="action" variant="neutral" onClick={fn()}>
            Bulk Action
          </Button>,
        ]}
      />
    );
  },
};

export const WithHeadlessPagination: Story = {
  render: () => {
    const [pageSize, setPageSize] = useState(5);
    const [pageIndex, setPageIndex] = useState(0);
    const start = pageIndex * pageSize;

    return (
      <EmployeeTable
        variant="headless"
        columns={basicColumns}
        data={employeeData.slice(start, start + pageSize)}
        pagination={{
          pageIndex,
          pageSize,
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

export const WithHeadlessCursorPagination: Story = {
  render: () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const start = pageIndex * pageSize;
    const pageData = employeeData.slice(start, start + pageSize);
    const hasNext = start + pageSize < employeeData.length;
    const nextCursor = hasNext ? `cursor_page_${pageIndex + 1}` : undefined;

    return (
      <EmployeeTable
        variant="headless"
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

export const WithHeadlessColumnFilter: Story = {
  args: {
    variant: "headless",
    columns: filterableColumns,
    data: employeeData,
    columnFilter: {
      showColumnFilters: true,
      filterTypes: ["contains", "equals", "startsWith"],
    },
  },
};

export const WithHeadlessAllFeatures: Story = {
  render: () => {
    const [pageSize, setPageSize] = useState(5);
    const [pageIndex, setPageIndex] = useState(0);
    const start = pageIndex * pageSize;

    return (
      <EmployeeTable
        variant="headless"
        columns={filterableColumns}
        data={employeeData.slice(start, start + pageSize)}
        sort={{ sortBy: [{ id: "salary", desc: true }] }}
        pagination={{
          pageIndex,
          pageSize,
          rowCount: employeeData.length,
          onPageChange: (newPageIndex, newPageSize) => {
            setPageIndex(newPageIndex);
            setPageSize(newPageSize);
          },
        }}
        globalFilter={{
          filterPlaceholder: "Search employees...",
          position: "left",
          onGlobalFilterChange: fn(),
        }}
        columnFilter={{
          showColumnFilters: false,
          filterTypes: ["contains", "equals"],
        }}
        topToolbarActions={[
          <Button key="add" variant="success" leftIcon={<IconPlus size={16} />} onClick={fn()}>
            Add Employee
          </Button>,
        ]}
        bottomToolbarActions={[
          <Button key="bulk" variant="neutral" onClick={fn()}>
            Bulk Action
          </Button>,
        ]}
        exportCSV={{ enabled: true, filename: "headless-export" }}
        reset={{ fn: fn() }}
        refresh={{ fn: fn() }}
      />
    );
  },
};
