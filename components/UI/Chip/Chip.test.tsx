import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Chip } from './index';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Chip', () => {
  it('renders children', () => {
    renderWithMantine(<Chip value="test">React</Chip>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    renderWithMantine(<Chip value="test" onChange={onChange}>Click me</Chip>);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is set', () => {
    renderWithMantine(<Chip value="test" disabled>Disabled</Chip>);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('renders checked state', () => {
    renderWithMantine(<Chip value="test" defaultChecked>Checked</Chip>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it.each([['primary'], ['secondary'], ['light'], ['success'], ['warning'], ['danger'], ['neutral']] as const)(
    'renders %s variant without errors',
    (variant) => {
      renderWithMantine(<Chip value="test" variant={variant}>Chip</Chip>);
      expect(screen.getByText('Chip')).toBeInTheDocument();
    }
  );

  it.each([['sm'], ['md'], ['lg']] as const)('renders %s size without errors', (size) => {
    renderWithMantine(<Chip value="test" size={size}>Chip</Chip>);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
