import { Alert as MantineAlert, MantineColor } from '@mantine/core'

type alertSeverity = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface Props {
  children: React.ReactNode;
  title?: React.ReactNode;
  severity?: alertSeverity;
  variant?: 'light' | 'filled' | 'outline';
  color?: MantineColor
  icon?: React.ReactNode;
  withCloseButton?: boolean;
  onClose?: () => void;
}

const SEVERITY_COLOR: Record<alertSeverity, string> = {
  info: 'brand',
  success: 'success',
  warning: 'warning.6',
  danger: 'error',
  neutral: 'gray-neutral'
};

export function Alert({
  children,
  title,
  severity = 'info',
  variant = 'light',
  color,
  icon,
  withCloseButton,
  onClose,
}: Props) {
  return (
    <MantineAlert
      title={title}
      color={color || SEVERITY_COLOR[severity] as MantineColor}
      variant={variant}
      icon={icon}
      withCloseButton={withCloseButton}
      onClose={onClose}
    >
      {children}
    </MantineAlert>
  );
}