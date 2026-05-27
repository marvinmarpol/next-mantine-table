import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from './index';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,

  argTypes: {
    variant: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
    color: {
      control: 'color'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Primary: Story = {
  args: { children: 'Primary', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};

export const Light: Story = {
  args: { children: 'Light', variant: 'light' },
};

export const Dot: Story = {
  args: { children: 'With Dot', variant: 'dot' },
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

export const Circle: Story = {
  args: { children: '9', circle: true, variant: 'light' },
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

      {(['primary', 'secondary', 'light', 'dot', 'success', 'warning', 'danger', 'neutral'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: '13px', padding: '13px', flexWrap: 'wrap', alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} >
              <Badge variant={variant} size={size}>{variant}</Badge>
            </div>
          ))}
        </div>
      ))}

    </>
  ),
};