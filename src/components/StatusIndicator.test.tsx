import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusIndicator from './StatusIndicator';

describe('StatusIndicator', () => {
  it('shows the safe label for a clean verdict', () => {
    render(<StatusIndicator score={96} level="SAFE" />);

    expect(screen.getByText('SAFE TRANSACTION')).toBeInTheDocument();
    expect(screen.getByText('96')).toBeInTheDocument();
  });

  it('shows the caution label for a medium verdict', () => {
    render(<StatusIndicator score={68} level="MEDIUM" />);

    expect(screen.getByText('SUSPICIOUS / CAUTION')).toBeInTheDocument();
  });

  it('shows the critical label for a high verdict', () => {
    render(<StatusIndicator score={12} level="HIGH" />);

    expect(screen.getByText('CRITICAL FRAUD RISK')).toBeInTheDocument();
  });

  it('renders in compact mode for the scanner HUD', () => {
    const { container } = render(<StatusIndicator score={12} level="HIGH" compact />);

    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('CRITICAL FRAUD RISK')).toBeInTheDocument();
  });

  it('applies the requested id and class names', () => {
    const { container } = render(
      <StatusIndicator id="verdict-card" score={96} level="SAFE" className="custom" />,
    );

    const root = container.querySelector('#verdict-card');
    expect(root).not.toBeNull();
    expect(root!.className).toContain('custom');
  });
});
