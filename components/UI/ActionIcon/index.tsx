import { ActionIcon as MantineActionIcon, MantineColor } from '@mantine/core';

type IconVariant = 'primary' | 'secondary' | 'light' | 'ghost' | 'success' | 'warning' | 'danger' | 'neutral';
type IconSize = 'sm' | 'md' | 'lg';

interface Props {
  'aria-label': string;
  variant?: IconVariant;
  size?: IconSize;
  disabled?: boolean;
  isLoading?: boolean;
  color?: MantineColor;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const VARIANT_MAP: Record<IconVariant, { variant: string; color: string }> = {
  primary: { variant: 'filled', color: 'brand' },
  secondary: { variant: 'outline', color: 'brand' },
  light: { variant: 'light', color: 'brand' },
  ghost: { variant: 'subtle', color: 'brand' },
  success: { variant: 'light', color: 'success' },
  warning: { variant: 'light', color: 'warning.5' },
  danger: { variant: 'light', color: 'error' },
  neutral: { variant: 'light', color: 'gray-neutral' },
};

export function ActionIcon({
  'aria-label': ariaLabel,
  variant = 'primary',
  size = 'md',
  disabled,
  isLoading,
  color,
  children,
  onClick,
}: Props) {
  const { variant: mantineVariant, color: variantColor } = VARIANT_MAP[variant];

  return (
    <MantineActionIcon
      variant={mantineVariant}
      color={color || variantColor as MantineColor}
      size={size}
      disabled={disabled}
      loading={isLoading}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </MantineActionIcon>
  );
}