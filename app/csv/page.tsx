"use client";

import { MantineProvider } from "@mantine/core";
import CSVTable from "@/components/Table/csv";

export default function Page() {
  return (
    <>
      <MantineProvider>
        <div className="p-8">
       <CSVTable  />
       </div>
      </MantineProvider>
    </>
  );
}
