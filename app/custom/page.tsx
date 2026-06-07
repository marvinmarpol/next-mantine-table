"use client";

import { Code, Flex, MantineProvider } from "@mantine/core";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MRT_ColumnDef } from "mantine-react-table";
import GenericTable from "@/components/Table/generic";
import CustomTable, { ColumnDefinition } from "@/components/Table/Custom";
import { mockApi } from "@/components/Table/Custom/mockData";
import { Badge } from "@/components/UI/Badge";
import { ActionIcon } from "@/components/UI/ActionIcon";
import {
  Icon123,
  Icon12Hours,
  Icon2fa,
  IconEraser,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

export default function Page() {
  type Person = {
    name: {
      firstName: string;
      lastName: string;
    };
    address: string;
    city: string;
    state: string;
    extra?: any;
  };

  const columns = useMemo<ColumnDefinition<Person>[]>(
    () => [
      {
        accessorKey: "name.firstName", //access nested data with dot notation
        header: "First Name",
        filterType: undefined,
      },
      {
        accessorKey: "name.lastName",
        header: "Last Name",
        Cell: ({ row }) => (
          <Badge color={"green"}>
            <h1>{row.name.lastName}</h1>
          </Badge>
        ),
        filterType: ["equals", "startsWith"],
      },
      {
        accessorKey: "address", //normal accessorKey
        header: "Address",
        filterType: ["contains"],
      },
      {
        accessorKey: "city",
        header: "City",
      },
      {
        accessorKey: "state",
        header: "State",
        enableClickToCopy: true,
        filterType: ["contains", "greaterThan"],
      },
      {
        accessorKey: "extra",
        header: "Extrasss",
        enableClickToCopy: false,
      },
    ],
    [],
  );

  //nested data is ok, see accessorKeys in ColumnDef below
  const staticPeople: Person[] = [
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Robert",
        lastName: "Smith",
      },
      address: "566 Brakus Inlet",
      city: "Westerville",
      state: "West Virginia",
    },
    {
      name: {
        firstName: "Kevin",
        lastName: "Yan",
      },
      address: "7777 Kuhic Knoll",
      city: "South Linda",
      state: "West Virginia",
    },
    {
      name: {
        firstName: "John",
        lastName: "Upton",
      },
      address: "722 Emie Stream",
      city: "Huntington",
      state: "Washington",
    },
    {
      name: {
        firstName: "Nathan",
        lastName: "Harris",
      },
      address: "1 Kuhic Knoll",
      city: "Ohiowa",
      state: "Nebraska",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
    },
    {
      name: {
        firstName: "Zachary",
        lastName: "Davis",
      },
      address: "261 Battle Ford",
      city: "Columbus",
      state: "Ohio",
      extra: <ActionIcon>test aja lah</ActionIcon>,
    },
  ];

  const { data: result, isLoading } = useQuery({
    queryKey: ["people"],
    queryFn: () => mockApi({ delay: 3000, payload: staticPeople, status: 200 }),
  });

  const PAGE_SIZE = 5;
  const [pageIndex, setPageIndex] = useState(0);
  const start = pageIndex * PAGE_SIZE;

  return (
    <>
      <MantineProvider>
        <div className="p-20">
          <CustomTable
            variant="basic"
            columns={columns}
            data={result?.data ?? []}
            isLoading={isLoading}
            pagination={{
              pageIndex: 0,
              pageSize: 5,
              rowCount: result?.data.length ?? 0,
              hasNext: true,
              nextCursor: 0,
              onPageChange: () => {},
            }}
            detailPanel={{
              render: ({ address }) => {
                return (
                  <div className="p-2">
                    <div className="mb-2 font-medium text-gray-700">
                      Request Details:
                    </div>
                    <Code block className="max-h-96 overflow-auto">
                      {address}
                    </Code>
                  </div>
                );
              },
            }}
            globalFilter={{
              filterPlaceholder: "search something man",
              position: 'right'
            }}
            columnPinning={{ right: ["name.firstName"], left: [] }}
            columnFilter={{
              showColumnFilters: false,
              filterTypes: ["greaterThan", "lessThan", "notEmpty"],
              /* onFiltersChange: (fns) => {
                console.log(fns);
              }, */
            }}
            exportPDF={{
              enabled: true,
            }}
          />
        </div>
      </MantineProvider>
    </>
  );
}
