import { Notification as MantineNotification, MantineColor } from '@mantine/core';

type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  info: 'brand',
  success: 'success',
  warning: 'warning.6',
  danger: 'error',
  neutral: 'gray-neutral',
};

export interface Props {
  children?: React.ReactNode;
  title?: React.ReactNode;
  severity?: NotificationSeverity;
  color?: MantineColor;
  icon?: React.ReactNode;
  withCloseButton?: boolean;
  withBorder?: boolean;
  loading?: boolean;
  onClose?: () => void;
}

export function Notification({
  children,
  title,
  severity = 'info',
  color,
  icon,
  withCloseButton,
  withBorder,
  loading,
  onClose,
}: Props) {
  return (
    <MantineNotification
      title={title}
      color={color || SEVERITY_COLOR[severity] as MantineColor}
      icon={icon}
      withCloseButton={withCloseButton}
      withBorder={withBorder}
      loading={loading}
      onClose={onClose}
    >
      {children}
    </MantineNotification>
  );
}
