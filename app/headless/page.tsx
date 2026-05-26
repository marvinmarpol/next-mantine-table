"use client";

import { MantineProvider } from "@mantine/core";
import AdvancedTable from "@/components/Table/advanced";
import HeadlessTable from "@/components/Table/headless";

export default function Page() {
  return (
    <>
      <MantineProvider>
        <div className="p-8">
       <HeadlessTable  />
       </div>
      </MantineProvider>
    </>
  );
}
