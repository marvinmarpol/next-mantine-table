import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Box, Menu, Text } from '@mantine/core';
import { IconUserCircle, IconSend } from '@tabler/icons-react';
import type { MRT_ColumnDef } from 'mantine-react-table';
import GenericTable from './index';
import { data as employeeData, type Employee } from '../advanced/makeData';
import { fakeData, usStates, type User } from '../crudModal/makeData';

// ── Employee columns (flat, for basic / export stories) ──────────────────────

const flatEmployeeColumns: MRT_ColumnDef<Employee>[] = [
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'jobTitle', header: 'Job Title' },
  { accessorKey: 'salary', header: 'Salary' },
  { accessorKey: 'startDate', header: 'Start Date' },
];

// ── Employee columns (grouped, for advanced story) ────────────────────────────

const groupedEmployeeColumns: MRT_ColumnDef<Employee>[] = [
  {
    id: 'employee',
    header: 'Employee',
    columns: [
      {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: 'name',
        header: 'Name',
        size: 250,
        Cell: ({ renderedCellValue, row }) => (
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              alt="avatar"
              height={28}
              src={row.original.avatar}
              style={{ borderRadius: '50%' }}
            />
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      { accessorKey: 'email', header: 'Email', enableClickToCopy: true },
    ],
  },
  {
    id: 'jobInfo',
    header: 'Job Info',
    columns: [
      {
        accessorKey: 'salary',
        header: 'Salary',
        Cell: ({ cell }) => (
          <Box
            style={(theme) => ({
              backgroundColor:
                cell.getValue<number>() < 50_000
                  ? theme.colors.red[9]
                  : cell.getValue<number>() < 75_000
                    ? theme.colors.yellow[9]
                    : theme.colors.green[9],
              borderRadius: 4,
              color: '#fff',
              padding: '2px 6px',
            })}
          >
            {cell.getValue<number>()?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            })}
          </Box>
        ),
      },
      { accessorKey: 'jobTitle', header: 'Job Title' },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
      },
    ],
  },
];

// ── User columns (for CRUD story) ────────────────────────────────────────────

const userColumns: MRT_ColumnDef<User>[] = [
  { accessorKey: 'id', header: 'ID', enableEditing: false, size: 80 },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    mantineEditTextInputProps: { required: true },
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    mantineEditTextInputProps: { required: true },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    mantineEditTextInputProps: { type: 'email', required: true },
  },
  {
    accessorKey: 'state',
    header: 'State',
    editVariant: 'select',
    mantineEditSelectProps: { data: usStates },
  },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const EmployeeTable = GenericTable<Employee>;

const meta: Meta<typeof EmployeeTable> = {
  title: 'Table/GenericTable',
  component: EmployeeTable,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Basic: StoryObj<typeof EmployeeTable> = {
  args: {
    columns: flatEmployeeColumns,
    data: employeeData.slice(0, 10),
  },
};

export const WithSorting: StoryObj<typeof EmployeeTable> = {
  args: {
    columns: flatEmployeeColumns,
    data: employeeData,
    enableSorting: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enablePagination: true,
  },
};

export const WithAdvancedFeatures: StoryObj<typeof EmployeeTable> = {
  args: {
    columns: groupedEmployeeColumns,
    data: employeeData,
    enableSorting: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    renderDetailPanel: ({ row }) => (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 16,
        }}
      >
        <img
          alt="avatar"
          height={120}
          src={row.original.avatar}
          style={{ borderRadius: '50%' }}
        />
        <Box>
          <Text fw={700}>Signature Catch Phrase:</Text>
          <Text>&quot;{row.original.signatureCatchPhrase}&quot;</Text>
        </Box>
      </Box>
    ),
    renderRowActionMenuItems: () => (
      <>
        <Menu.Item leftSection={<IconUserCircle size={16} />}>View Profile</Menu.Item>
        <Menu.Item leftSection={<IconSend size={16} />}>Send Email</Menu.Item>
      </>
    ),
  },
};

// CRUD story uses User type — define a separate typed story component
const UserTable = GenericTable<User>;

export const WithCRUD: StoryObj<typeof UserTable> = {
  render: (args) => <UserTable {...args} />,
  args: {
    columns: userColumns,
    data: fakeData,
    enableCreate: true,
    enableEdit: true,
    enableDelete: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onCreateRow: fn() as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEditRow: fn() as any,
    onDeleteRow: fn(),
  },
};

export const WithCSVExport: StoryObj<typeof EmployeeTable> = {
  args: {
    columns: flatEmployeeColumns,
    data: employeeData,
    enableCSVExport: true,
    enableRowSelection: true,
    enablePagination: true,
  },
};

export const WithPDFExport: StoryObj<typeof EmployeeTable> = {
  args: {
    columns: flatEmployeeColumns,
    data: employeeData,
    enablePDFExport: true,
    enableRowSelection: true,
    enablePagination: true,
    pdfFilename: 'employee-export',
  },
};

export const Loading: StoryObj<typeof EmployeeTable> = {
  args: {
    columns: flatEmployeeColumns,
    data: [],
    isLoading: true,
  },
};
