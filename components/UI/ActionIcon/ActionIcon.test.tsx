import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ActionIcon } from './index';

const Icon = () => <svg data-testid="icon" />;

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('ActionIcon', () => {
  it('renders children', () => {
    renderWithMantine(<ActionIcon aria-label="Test"><Icon /></ActionIcon>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('has the correct aria-label', () => {
    renderWithMantine(<ActionIcon aria-label="Delete"><Icon /></ActionIcon>);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    renderWithMantine(<ActionIcon aria-label="Click" onClick={onClick}><Icon /></ActionIcon>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is set', () => {
    renderWithMantine(<ActionIcon aria-label="Disabled" disabled><Icon /></ActionIcon>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it.each([['primary'], ['secondary'], ['ghost'], ['danger']] as const)(
    'renders %s variant without errors',
    (variant) => {
      renderWithMantine(<ActionIcon aria-label="v" variant={variant}><Icon /></ActionIcon>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    }
  );
});
