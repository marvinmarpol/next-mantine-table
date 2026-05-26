"use client";

import { MantineProvider } from "@mantine/core";
import PDFTable from "@/components/Table/pdf";
import CrudModalTableWithProviders from "@/components/Table/crudModal";

export default function Page() {
  return (
    <>
      <MantineProvider>
        <div className="p-8">
       <CrudModalTableWithProviders  />
       </div>
      </MantineProvider>
    </>
  );
}
