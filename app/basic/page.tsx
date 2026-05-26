"use client";

import { MantineProvider } from "@mantine/core";
import BasicTable from "@/components/Table/basic";

export default function Page() {
  return (
    <>
      <MantineProvider>
        <div className="p-8">
       <BasicTable  />
       </div>
      </MantineProvider>
    </>
  );
}
