"use client";

import { Flex, MantineProvider } from "@mantine/core";
import { useMemo, useState } from "react";
import { MRT_ColumnDef } from "mantine-react-table";
import GenericTable from "@/components/Table/generic";
import CustomTable, { ColumnDefinition } from "@/components/Table/Custom";
import { Badge } from "@/components/UI/Badge";
import { ActionIcon } from "@/components/UI/ActionIcon";
import { Icon123, IconEraser, IconTrash } from "@tabler/icons-react";

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
      },
      {
        accessorKey: "name.lastName",
        header: "Last Name",
        Cell: ({ row }) => (
          <Badge color={"green"}>
            <h1>{row.name.lastName}</h1>
          </Badge>
        ),
      },
      {
        accessorKey: "address", //normal accessorKey
        header: "Address",
      },
      {
        accessorKey: "city",
        header: "City",
      },
      {
        accessorKey: "state",
        header: "State",
        enableClickToCopy: true
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
  const data: Person[] = [
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
      extra: <ActionIcon>test aja lah</ActionIcon>
    },
  ];

  const PAGE_SIZE = 5;
  const [pageIndex, setPageIndex] = useState(0);
  const start = pageIndex * PAGE_SIZE;

  return (
    <>
      <MantineProvider>
        <div className="p-8">
          <CustomTable
            variant="headless"
            columns={columns}
            data={data}
            refresh={{fn: ()=>{alert('refresh')}}}
            reset={{fn: ()=>{alert('reset')}}}
            sortBy={[{ id: "name.firstName", desc: false }, { id: "address", desc: true }]}
            globalFilter={{
              //onGlobalFilterChange: (value)=>{console.log(value)}
            }}
            /* pagination={{
              pageIndex: 0,
              pageSize: 10,
              rowCount: data.length,
              nextCursor: 0,
              hasNext: true,
              onPageChange: (newPageIndex, newPageSize)=>{
                setPageIndex(newPageIndex);
              }
            }} */
          />
        </div>
      </MantineProvider>
    </>
  );
}
