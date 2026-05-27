import { Chip as MantineChip, MantineColor } from '@mantine/core';

type chipVariant = 'primary' | 'secondary' | 'light' | 'success' | 'warning' | 'danger' | 'neutral';

export interface Props {
  children: React.ReactNode;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: MantineColor;
  variant?: chipVariant;
}

const VARIANT_MAP: Record<chipVariant, { variant: string; color: string }> = {
  primary: { variant: 'filled', color: 'brand' },
  secondary: { variant: 'outline', color: 'brand' },
  light: { variant: 'light', color: 'brand' },
  success: { variant: 'light', color: 'success' },
  warning: { variant: 'light', color: 'warning.5' },
  danger: { variant: 'light', color: 'error' },
  neutral: { variant: 'outline', color: 'gray-neutral' },
};

export function Chip({
  children,
  value,
  checked,
  defaultChecked,
  onChange,
  disabled,
  size = 'md',
  color,
  variant = 'primary',
}: Props) {
  const { variant: mantineVariant, color: variantColor } = VARIANT_MAP[variant];

  return (
    <MantineChip
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      disabled={disabled}
      size={size}
      color={color || variantColor as MantineColor}
      variant={mantineVariant}
    >
      {children}
    </MantineChip>
  );
}
