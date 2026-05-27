import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Badge } from './index';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('Badge', () => {
  it('renders children', () => {
    renderWithMantine(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it.each([['primary'], ['secondary'], ['light'], ['success'], ['warning'], ['danger']] as const)(
    'renders %s variant without errors',
    (variant) => {
      renderWithMantine(<Badge variant={variant}>Badge</Badge>);
      expect(screen.getByText('Badge')).toBeInTheDocument();
    }
  );

  it.each([['brand'], ['success'], ['warning'], ['error'], ['gray-neutral']] as const)(
    'renders %s color without errors',
    (color) => {
      renderWithMantine(<Badge color={color}>Badge</Badge>);
      expect(screen.getByText('Badge')).toBeInTheDocument();
    }
  );

  it.each([['sm'], ['md'], ['lg']] as const)('renders %s size without errors', (size) => {
    renderWithMantine(<Badge size={size}>Badge</Badge>);
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });
});
