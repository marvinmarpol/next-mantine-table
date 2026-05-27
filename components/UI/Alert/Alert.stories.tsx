import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Alert } from './index';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,

  argTypes: {
    severity: {
      control: 'select',
    },
    variant: {
      control: 'select',
    },
    color: {
      control: 'color'
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: { severity: 'info', title: 'Information', children: 'Your session will expire in 10 minutes.' },
};

export const Success: Story = {
  args: { severity: 'success', title: 'Transfer complete', children: 'Rp 500.000 has been sent successfully.' },
};

export const Warning: Story = {
  args: { severity: 'warning', title: 'Unusual activity', children: 'We detected a login from a new device.' },
};

export const Danger: Story = {
  args: { severity: 'danger', title: 'Transaction failed', children: 'Insufficient balance. Please top up your account.' },
};

export const Neutral: Story = {
  args: { severity: 'neutral', title: 'Transaction failed', children: 'Insufficient balance. Please top up your account.' },
};

export const Filled: Story = {
  args: { severity: 'info', variant: 'filled', title: 'Filled variant', children: 'This uses the filled style.' },
};

export const Outline: Story = {
  args: { severity: 'success', variant: 'outline', title: 'Outline variant', children: 'This uses the outline style.' },
};

export const WithCloseButton: Story = {
  args: {
    severity: 'warning',
    title: 'Dismissible alert',
    children: 'Click X to dismiss.',
    withCloseButton: true,
  },
};

export const AllVariants = {
  render: () => (
    <>

      {(['info', 'success', 'warning', 'danger', 'neutral'] as const).map((severity) => (
        <div key={severity}>
          <div style={{ margin: '13px' }}>
            <Alert severity={severity} title='Information' withCloseButton>Your session will expire in 10 minutes.</Alert>
          </div>
          {(['filled', 'outline'] as const).map((variant) => (
            <>
              <div key={variant} style={{ margin: '13px' }}>
                <Alert severity={severity} variant={variant} title='Information' withCloseButton>Your session will expire in 10 minutes.</Alert>
              </div>
            </>
          ))}
        </div>
      ))}

    </>
  ),
};