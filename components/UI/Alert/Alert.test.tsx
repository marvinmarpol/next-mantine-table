import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Alert } from './index';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Alert', () => {
  it('renders children', () => {
    renderWithMantine(<Alert>Something happened.</Alert>);
    expect(screen.getByText('Something happened.')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    renderWithMantine(<Alert title="Warning">Watch out.</Alert>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithMantine(<Alert withCloseButton onClose={onClose}>Alert</Alert>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it.each([['info'], ['success'], ['warning'], ['danger']] as const)(
    'renders %s severity without errors',
    (severity) => {
      renderWithMantine(<Alert severity={severity}>{severity} alert</Alert>);
      expect(screen.getByText(`${severity} alert`)).toBeInTheDocument();
    }
  );

  it.each([['light'], ['filled'], ['outline']] as const)(
    'renders %s variant without errors',
    (variant) => {
      renderWithMantine(<Alert variant={variant}>Alert</Alert>);
      expect(screen.getByText('Alert')).toBeInTheDocument();
    }
  );
});