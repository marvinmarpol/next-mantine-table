import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { IconArrowLeft, IconDisabled, IconDotsVertical, IconEdit, IconExclamationMark, IconExternalLink, IconEye, IconGhost, IconHelpCircle, IconInfoCircle, IconLoader, IconRefresh, IconThumbUp, IconTrash, IconUpload, IconX } from '@tabler/icons-react';

import { ActionIcon } from './index';

const meta: Meta<typeof ActionIcon> = {
  title: 'UI/ActionIcon',
  component: ActionIcon,

  argTypes: {
    variant: {
      control: 'select',
    },
    size: {
      control: 'select',
    },
    color: {
      control: 'color'
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActionIcon>;

export const Primary: Story = {
  args: { variant: 'primary', 'aria-label': 'View', children: <IconEye />, onClick: fn() },
};

export const Secondary: Story = {
  args: { variant: 'secondary', 'aria-label': 'Edit', children: <IconEdit />, onClick: fn() },
};

export const Light: Story = {
  args: { variant: 'light', 'aria-label': 'Upload', children: <IconUpload />, onClick: fn() },
};

export const Ghost: Story = {
  args: { variant: 'ghost', 'aria-label': 'Ghost', children: <IconGhost />, onClick: fn() },
};

export const Success: Story = {
  args: { variant: 'success', 'aria-label': 'Ok', children: <IconThumbUp />, onClick: fn() },
};

export const Warning: Story = {
  args: { variant: 'warning', 'aria-label': 'Warning', children: <IconExclamationMark />, onClick: fn() },
};

export const Danger: Story = {
  args: { variant: 'danger', 'aria-label': 'Delete', children: <IconTrash />, onClick: fn() },
};

export const Neutral: Story = {
  args: { variant: 'neutral', 'aria-label': 'Delete', children: <IconTrash />, onClick: fn() },
};

export const Loading: Story = {
  args: { variant: 'primary', isLoading: true, 'aria-label': 'Loading', children: <IconLoader /> },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true, 'aria-label': 'Disabled', children: <IconDisabled /> },
};

export const Small: Story = {
  args: { variant: 'primary', size: 'sm', 'aria-label': 'Info', children: <IconInfoCircle />, onClick: fn() },
};

export const Large: Story = {
  args: { variant: 'primary', size: 'lg', 'aria-label': 'Link', children: <IconExternalLink />, onClick: fn() },
};

export const AllVariants = {
  render: () => (
    <>

      {(['primary', 'secondary', 'light', 'ghost', 'success', 'warning', 'danger', 'neutral'] as const).map((variant) => (
        <div key={variant}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', gap: '13px', padding: '13px', flexWrap: 'wrap', alignItems: 'center' }}>
              <ActionIcon variant={variant} size={size} aria-label='View'><IconEye /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Edit'><IconEdit /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Upload'><IconUpload /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Ok'><IconThumbUp /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Warning'><IconExclamationMark /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Delete'><IconTrash /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Back'><IconArrowLeft /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Refresh'><IconRefresh /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Help'><IconHelpCircle /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Clear'><IconX /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Info'><IconInfoCircle /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='Info'><IconExternalLink /></ActionIcon>
              <ActionIcon variant={variant} size={size} aria-label='More'><IconDotsVertical /></ActionIcon>
            </div>
          ))}
        </div>
      ))}

    </>
  ),
};