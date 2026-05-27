'use client';

import { useMemo } from 'react';
import {
  MantineReactTable,
  MRT_EditActionButtons,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_RowData,
  type MRT_TableOptions,
} from 'mantine-react-table';
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconDownload } from '@tabler/icons-react';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)\\

export interface GenericTableProps<T extends MRT_RowData> {
  columns: MRT_ColumnDef<T>[];
  data: T[];

  isLoading?: boolean;

  enableSorting?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnOrdering?: boolean;
  enableGrouping?: boolean;
  enableColumnPinning?: boolean;

  enableCSVExport?: boolean;
  enablePDFExport?: boolean;
  pdfFilename?: string;

  enableCreate?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  onCreateRow?: MRT_TableOptions<T>['onCreatingRowSave'];
  onEditRow?: MRT_TableOptions<T>['onEditingRowSave'];
  onDeleteRow?: (row: MRT_Row<T>) => void;

  renderDetailPanel?: MRT_TableOptions<T>['renderDetailPanel'];
  renderRowActionMenuItems?: MRT_TableOptions<T>['renderRowActionMenuItems'];

  tableOptions?: Partial<Omit<MRT_TableOptions<T>, 'columns' | 'data'>>;
}

export default function GenericTable<T extends MRT_RowData>({
  columns,
  data,
  isLoading,
  enableSorting = false,
  enableColumnFilters = false,
  enableGlobalFilter = false,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnOrdering = false,
  enableGrouping = false,
  enableColumnPinning = false,
  enableCSVExport = false,
  enablePDFExport = false,
  pdfFilename = 'table-export',
  enableCreate = false,
  enableEdit = false,
  enableDelete = false,
  onCreateRow,
  onEditRow,
  onDeleteRow,
  renderDetailPanel,
  renderRowActionMenuItems,
  tableOptions,
}: GenericTableProps<T>) {
  const csvConfig = useMemo(
    () => mkConfig({ fieldSeparator: ',', decimalSeparator: '.', useKeysAsHeaders: true }),
    [],
  );

  const hasCRUD = enableCreate || enableEdit || enableDelete;
  const hasRowActions = enableEdit || enableDelete;
  const hasToolbarActions = enableCSVExport || enablePDFExport || enableCreate;

  const handleCSVExportAllData = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csv = generateCsv(csvConfig)(data as any);
    download(csvConfig)(csv);
  };

  const handleCSVExportRows = (rows: MRT_Row<T>[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csv = generateCsv(csvConfig)(rows.map((r) => r.original) as any);
    download(csvConfig)(csv);
  };

  const handlePDFExportRows = (rows: MRT_Row<T>[]) => {
    const doc = new jsPDF();
    const tableData = rows.map((row) => Object.values(row.original as object));
    const tableHeaders = columns
      .filter((c) => typeof c.header === 'string')
      .map((c) => c.header as string);
    autoTable(doc, { head: [tableHeaders], body: tableData });
    doc.save(`${pdfFilename}.pdf`);
  };

  const opts: MRT_TableOptions<T> = {
    columns,
    data,
    enableSorting,
    enableColumnFilters,
    enableGlobalFilter,
    enablePagination,
    enableRowSelection,
    enableColumnOrdering,
    enableGrouping,
    enableColumnPinning,
    enableEditing: hasCRUD,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableRowActions: hasRowActions,
    state: { isLoading: isLoading ?? false },
    renderDetailPanel,
    renderRowActionMenuItems,
    onCreatingRowSave: onCreateRow,
    onEditingRowSave: onEditRow,
    renderCreateRowModalContent: hasCRUD
      ? ({ table: t, row, internalEditComponents }) => (
          <Stack>
            <Title order={3}>Create New Row</Title>
            {internalEditComponents}
            <Flex justify="flex-end" mt="xl">
              <MRT_EditActionButtons variant="text" table={t} row={row} />
            </Flex>
          </Stack>
        )
      : undefined,
    renderEditRowModalContent: hasCRUD
      ? ({ table: t, row, internalEditComponents }) => (
          <Stack>
            <Title order={3}>Edit Row</Title>
            {internalEditComponents}
            <Flex justify="flex-end" mt="xl">
              <MRT_EditActionButtons variant="text" table={t} row={row} />
            </Flex>
          </Stack>
        )
      : undefined,
    renderRowActions: hasRowActions
      ? ({ row, table: t }) => (
          <Flex gap="md">
            {enableEdit && (
              <Tooltip label="Edit">
                <ActionIcon onClick={() => t.setEditingRow(row)}>
                  <IconEdit />
                </ActionIcon>
              </Tooltip>
            )}
            {enableDelete && (
              <Tooltip label="Delete">
                <ActionIcon
                  color="red"
                  onClick={() => {
                    if (onDeleteRow) {
                      onDeleteRow(row);
                    } else {
                      modals.openConfirmModal({
                        title: 'Confirm Delete',
                        children: (
                          <Text>Are you sure you want to delete this row?</Text>
                        ),
                        labels: { confirm: 'Delete', cancel: 'Cancel' },
                        confirmProps: { color: 'red' },
                        onConfirm: () => {},
                      });
                    }
                  }}
                >
                  <IconTrash />
                </ActionIcon>
              </Tooltip>
            )}
          </Flex>
        )
      : undefined,
    renderTopToolbarCustomActions: hasToolbarActions
      ? ({ table: t }) => (
          <Flex gap="xs" wrap="wrap">
            {enableCreate && (
              <Button onClick={() => t.setCreatingRow(true)}>Create New</Button>
            )}
            {enableCSVExport && (
              <>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  onClick={handleCSVExportAllData}
                >
                  Export All Data
                </Button>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  disabled={t.getPrePaginationRowModel().rows.length === 0}
                  onClick={() => handleCSVExportRows(t.getPrePaginationRowModel().rows)}
                >
                  Export All Rows
                </Button>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  disabled={t.getRowModel().rows.length === 0}
                  onClick={() => handleCSVExportRows(t.getRowModel().rows)}
                >
                  Export Page Rows
                </Button>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  disabled={!t.getIsSomeRowsSelected() && !t.getIsAllRowsSelected()}
                  onClick={() => handleCSVExportRows(t.getSelectedRowModel().rows)}
                >
                  Export Selected
                </Button>
              </>
            )}
            {enablePDFExport && (
              <>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  color="red"
                  disabled={t.getPrePaginationRowModel().rows.length === 0}
                  onClick={() => handlePDFExportRows(t.getPrePaginationRowModel().rows)}
                >
                  PDF All Rows
                </Button>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  color="red"
                  disabled={t.getRowModel().rows.length === 0}
                  onClick={() => handlePDFExportRows(t.getRowModel().rows)}
                >
                  PDF Page Rows
                </Button>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  color="red"
                  disabled={!t.getIsSomeRowsSelected() && !t.getIsAllRowsSelected()}
                  onClick={() => handlePDFExportRows(t.getSelectedRowModel().rows)}
                >
                  PDF Selected
                </Button>
              </>
            )}
          </Flex>
        )
      : undefined,
    ...tableOptions,
  };

  const table = useMantineReactTable(opts);

  return <MantineReactTable table={table} />;
}
