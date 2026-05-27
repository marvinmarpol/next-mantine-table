import { Badge as MantineBadge, MantineColor } from '@mantine/core';

type badgeVariant = 'primary' | 'secondary' | 'light' | 'dot' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: badgeVariant;
  size?: 'sm' | 'md' | 'lg';
  color?: MantineColor;
  fullWidth?: boolean;
  circle?: boolean;
}

const VARIANT_MAP: Record<badgeVariant, { variant: string; color: string }> = {
  primary: { variant: 'filled', color: 'brand' },
  secondary: { variant: 'outline', color: 'brand' },
  light: { variant: 'light', color: 'brand' },
  dot: { variant: 'dot', color: 'brand' },
  success: { variant: 'light', color: 'success' },
  warning: { variant: 'light', color: 'warning.5' },
  danger: { variant: 'light', color: 'error' },
  neutral: { variant: 'light', color: 'gray-neutral' },
};

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  color,
  fullWidth,
  circle,
}: BadgeProps) {
  const { variant: mantineVariant, color: variantColor } = VARIANT_MAP[variant];

  return (
    <MantineBadge
      variant={mantineVariant}
      size={size}
      color={color || variantColor as MantineColor}
      fullWidth={fullWidth}
      circle={circle}
    >
      {children}
    </MantineBadge>
  );
}