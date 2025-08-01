import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders loading spinner with default styling', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-gray-900');
  });

  it('renders with accessibility role when specified', () => {
    render(<LoadingSpinner role="status" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with container wrapper by default', () => {
    render(<LoadingSpinner />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveClass('flex', 'justify-center', 'items-center', 'py-12');
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