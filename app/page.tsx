"use client";

import { List, MantineProvider, ThemeIcon } from "@mantine/core";
import { IconCircleDashedLetterI } from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  return (
    <MantineProvider>
      <List>
        <List.Item>
          <li>
            <Link href="/basic">Basic Table</Link>
          </li>
        </List.Item>
        <List.Item>
          <li>
            <Link href="/advanced">Advanced Table</Link>
          </li>
        </List.Item>
      </List>
    </MantineProvider>
  );
}
