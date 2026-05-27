import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { IconCheck, IconExclamationMark, IconInfoCircle, IconX } from '@tabler/icons-react';

import { Notification } from './index';

const meta: Meta<typeof Notification> = {
  title: 'UI/Notification',
  component: Notification,
  argTypes: {
    severity: {
      control: 'select',
    },
    color: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Notification>;

export const Info: Story = {
  args: {
    severity: 'info',
    title: 'Information',
    children: 'Your session will expire in 10 minutes.',
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    title: 'Transfer complete',
    children: 'Rp 500.000 has been sent successfully.',
  },
};

export const Warning: Story = {
  args: {
    severity: 'warning',
    title: 'Unusual activity',
    children: 'We detected a login from a new device.',
  },
};

export const Danger: Story = {
  args: {
    severity: 'danger',
    title: 'Transaction failed',
    children: 'Insufficient balance. Please top up your account.',
  },
};

export const Neutral: Story = {
  args: {
    severity: 'neutral',
    title: 'Note',
    children: 'This is a neutral notification.',
  },
};

export const WithCloseButton: Story = {
  args: {
    severity: 'info',
    title: 'Dismissible',
    children: 'Click X to dismiss.',
    withCloseButton: true,
    onClose: fn(),
  },
};

export const WithIcon: Story = {
  args: {
    severity: 'info',
    title: 'With Icon',
    children: 'This notification has a custom icon.',
    icon: <IconInfoCircle size={18} />,
  },
};

export const WithBorder: Story = {
  args: {
    severity: 'success',
    title: 'With Border',
    children: 'This notification has a border.',
    withBorder: true,
  },
};

export const Loading: Story = {
  args: {
    severity: 'info',
    title: 'Loading',
    children: 'Processing your request...',
    loading: true,
    withCloseButton: false,
  },
};

export const AllVariants = {
  render: () => (
    <>
      {(['info', 'success', 'warning', 'danger', 'neutral'] as const).map((severity) => (
        <div key={severity} style={{ margin: '13px' }}>
          <Notification severity={severity} title={severity} withCloseButton>
            This is a {severity} notification.
          </Notification>
        </div>
      ))}
      <div style={{ margin: '13px' }}>
        <Notification severity="info" title="With Icon" icon={<IconInfoCircle size={18} />} withCloseButton>
          Notification with a custom icon.
        </Notification>
      </div>
      <div style={{ margin: '13px' }}>
        <Notification severity="success" title="With Border" withBorder withCloseButton>
          Notification with a border.
        </Notification>
      </div>
      <div style={{ margin: '13px' }}>
        <Notification severity="info" title="Loading" loading withCloseButton={false}>
          Processing your request...
        </Notification>
      </div>
    </>
  ),
};
