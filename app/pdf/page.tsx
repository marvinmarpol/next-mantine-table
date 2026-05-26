"use client";

import { MantineProvider } from "@mantine/core";
import PDFTable from "@/components/Table/pdf";

export default function Page() {
  return (
    <>
      <MantineProvider>
        <div className="p-8">
       <PDFTable  />
       </div>
      </MantineProvider>
    </>
  );
}
