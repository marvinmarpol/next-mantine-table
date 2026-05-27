import React from 'react';
import type { Preview } from '@storybook/nextjs';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ModalsProvider>
            <Story />
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
