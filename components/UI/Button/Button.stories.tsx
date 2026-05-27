import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test'

import { Button } from './index';
import { IconExternalLink, IconLogout, IconPlus } from '@tabler/icons-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
    type: {
      control: 'select',
    },
    color: {
      control: 'color'
    },
    target: {
      if: { arg: 'href', truthy: true },
      control: 'select',
    },
    rel: {
      if: { arg: 'href', truthy: true }
    }
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    onClick: fn()
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    onClick: fn()
  },
};

export const Light: Story = {
  args: {
    variant: 'light',
    children: 'Light Button',
    onClick: fn()
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
    onClick: fn()
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
    onClick: fn()
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning Button',
    onClick: fn()
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
    onClick: fn()
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'Neutral Button',
    onClick: fn()
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
    onClick: fn()
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
    onClick: fn()
  },
};

export const AllVariants = {
  render: () => (
    <>

      {(['primary', 'secondary', 'light', 'ghost', 'success', 'warning', 'danger', 'neutral'] as const).map((variant) => (
        <div key={variant}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', gap: '13px', padding: '13px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant={variant} size={size}>Submit</Button>
              <Button variant={variant} size={size} leftIcon={<IconPlus />}>New application</Button>
              <Button variant={variant} size={size} rightIcon={<IconLogout />}>Logout</Button>
              <Button variant={variant} size={size} rightIcon={<IconExternalLink />} href='http://example.com' target='_blank'>Open External Link</Button>
            </div>
          ))}
        </div>
      ))}

    </>
  ),
};