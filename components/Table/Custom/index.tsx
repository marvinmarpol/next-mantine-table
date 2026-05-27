import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)\\

type columnDefinition<T> = {
    name: string
    accessorKey: string
    enableClickToCopy?: boolean
  }

interface Props<T extends Record<string, any>> {
  columns: columnDef<T>[]
  data: T[];
}

const CustomTable = <T extends Record<string, any>>({
  columns,
  data,
}: Props<T>) => {
  const table = useMantineReactTable({
    columns,
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });

  return <MantineReactTable table={table} />;
};

export default CustomTable;
