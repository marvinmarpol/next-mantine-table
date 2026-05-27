import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { Button } from './index';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Button', () => {
  it('renders children', () => {
    renderWithMantine(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    renderWithMantine(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    renderWithMantine(<Button onClick={onClick} disabled>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    renderWithMantine(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders as submit button', () => {
    renderWithMantine(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it.each([
    ['primary'],
    ['secondary'],
    ['ghost'],
    ['danger'],
  ] as const)('renders %s variant without errors', (variant) => {
    renderWithMantine(<Button variant={variant}>{variant}</Button>);
    expect(screen.getByText(variant)).toBeInTheDocument();
  });

  it.each([['sm'], ['md'], ['lg']] as const)('renders %s size without errors', (size) => {
    renderWithMantine(<Button size={size}>Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with correct href', () => {
    renderWithMantine(<Button href="/about">About</Button>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/about');
  });

  it('renders with target="_blank" and safe rel', () => {
    renderWithMantine(
      <Button href="https://example.com" target="_blank">
        External
      </Button>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves custom rel when target is not _blank', () => {
    renderWithMantine(
      <Button href="/page" rel="nofollow">
        Page
      </Button>
    );
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'nofollow');
  });

});