"use client";

import { MantineProvider } from "@mantine/core";
import AdvancedTable from "@/components/Table/advanced";

export default function Page() {
  return (
    <>
      <MantineProvider>
        <div className="p-8">
       <AdvancedTable  />
       </div>
      </MantineProvider>
    </>
  );
}
