import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Notification } from './index';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Notification', () => {
  it('renders children', () => {
    renderWithMantine(<Notification>Something happened.</Notification>);
    expect(screen.getByText('Something happened.')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    renderWithMantine(<Notification title="Alert">Watch out.</Notification>);
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithMantine(
      <Notification withCloseButton onClose={onClose}>Notification</Notification>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it.each([['info'], ['success'], ['warning'], ['danger'], ['neutral']] as const)(
    'renders %s severity without errors',
    (severity) => {
      renderWithMantine(
        <Notification severity={severity}>{severity} notification</Notification>
      );
      expect(screen.getByText(`${severity} notification`)).toBeInTheDocument();
    }
  );

  it('shows loading state', () => {
    renderWithMantine(<Notification loading>Loading...</Notification>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with border', () => {
    renderWithMantine(<Notification withBorder>With border</Notification>);
    expect(screen.getByText('With border')).toBeInTheDocument();
  });
});
