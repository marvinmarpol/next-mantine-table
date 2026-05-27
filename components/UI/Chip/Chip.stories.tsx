import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Chip } from './index';

const meta: Meta<typeof Chip> = {
  title: 'UI/Chip',
  component: Chip,
  argTypes: {
    variant: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
    color: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Primary: Story = {
  args: { children: 'Primary', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};

export const Light: Story = {
  args: { children: 'Light', variant: 'light' },
};

export const Success: Story = {
  args: { children: 'Success', variant: 'success' },
};

export const Warning: Story = {
  args: { children: 'Warning', variant: 'warning' },
};

export const Danger: Story = {
  args: { children: 'Danger', variant: 'danger' },
};

export const Neutral: Story = {
  args: { children: 'Neutral', variant: 'neutral' },
};

export const Small: Story = {
  args: { children: 'Small', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Large', size: 'lg' },
};

export const AllVariants = {
  render: () => (
    <>
      {(['primary', 'secondary', 'light', 'success', 'warning', 'danger', 'neutral'] as const).map((variant) => (
        <div key={variant}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', gap: '13px', padding: '13px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip variant={variant} size={size} value="default">{variant}</Chip>
              <Chip variant={variant} size={size} value="checked" defaultChecked>{variant} checked</Chip>
              <Chip variant={variant} size={size} value="disabled" disabled>{variant} disabled</Chip>
            </div>
          ))}
        </div>
      ))}
    </>
  ),
};
