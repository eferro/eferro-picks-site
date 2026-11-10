import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner with spin animation', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('is announced to screen readers as a loading status by default', () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders with container wrapper by default', () => {
    render(<LoadingSpinner />);

    const container = screen.getByTestId('loading-container');
    expect(container).toBeInTheDocument();
  });

  it('renders without container when disabled', () => {
    render(<LoadingSpinner noContainer />);
    
    expect(screen.queryByTestId('loading-container')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('custom-class');
  });
});