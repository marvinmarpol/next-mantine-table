import { Button as MantineButton, MantineColor } from '@mantine/core';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'light' | 'ghost' | 'success' | 'warning' | 'danger' | 'neutral';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  color?: MantineColor
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const VARIANT_MAP: Record<ButtonVariant, { variant: string; color?: string }> = {
  primary: { variant: 'filled', color: 'brand' },
  secondary: { variant: 'outline', color: 'brand' },
  light: { variant: 'light', color: 'brand' },
  ghost: { variant: 'subtle', color: 'brand' },
  success: { variant: 'light', color: 'success' },
  warning: { variant: 'light', color: 'warning.5' },
  danger: { variant: 'filled', color: 'error' },
  neutral: { variant: 'light', color: 'gray-neutral' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  color,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  fullWidth = false,
  href,
  target,
  rel,
  children,
  onClick,
}: Props) {
  const { variant: mantineVariant, color: variantColor } = VARIANT_MAP[variant];

  const linkProps = href
    ? {
      component: Link,
      href,
      target,
      rel: target === '_blank' ? (rel ?? 'noopener noreferrer') : rel,
    }
    : {};

  return (
    <MantineButton
      variant={mantineVariant}
      color={color || variantColor as MantineColor}
      size={size}
      loading={isLoading}
      leftSection={leftIcon}
      rightSection={rightIcon}
      disabled={disabled}
      type={href ? undefined : type}
      fullWidth={fullWidth}
      onClick={onClick}
      {...(linkProps as any)}
    >
      {children}
    </MantineButton>
  );
}