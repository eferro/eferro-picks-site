import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('announces the error message to screen readers', () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('renders with container wrapper by default', () => {
    render(<ErrorMessage message="Error occurred" />);

    const container = screen.getByTestId('error-container');
    expect(container).toBeInTheDocument();
  });

  it('renders without container when disabled', () => {
    render(<ErrorMessage message="Error occurred" noContainer />);
    
    expect(screen.queryByTestId('error-container')).not.toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('applies custom className to message', () => {
    render(<ErrorMessage message="Error" className="custom-error" />);
    
    const message = screen.getByText('Error');
    expect(message).toHaveClass('custom-error');
  });

  it('applies custom containerClassName when provided', () => {
    render(<ErrorMessage message="Error" containerClassName="custom-container" />);
    
    const container = screen.getByTestId('error-container');
    expect(container).toHaveClass('custom-container');
  });
});