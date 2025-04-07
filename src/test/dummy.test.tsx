import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
function DummyComponent() {
  return <div data-testid="dummy">Hello Test</div>;
}

describe('Testing Infrastructure', () => {
  it('renders a simple component', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toHaveTextContent('Hello Test');
  });
}); 