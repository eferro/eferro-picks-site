import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageContainer } from './PageContainer';

describe('PageContainer', () => {
  it('renders children with default role', () => {
    render(
      <PageContainer>
        <div data-testid="child">Test content</div>
      </PageContainer>
    );

    const container = screen.getByRole('main');
    const child = screen.getByTestId('child');

    expect(container).toBeInTheDocument();
    expect(child).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <PageContainer className="custom-class">
        <div>Content</div>
      </PageContainer>
    );
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('custom-class');
  });

  it('supports custom role override', () => {
    render(
      <PageContainer role="region" aria-label="Custom region">
        <div>Content</div>
      </PageContainer>
    );
    
    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'Custom region');
  });

  it('renders as div when role is explicitly set to none', () => {
    render(
      <PageContainer role={undefined}>
        <div data-testid="child">Content</div>
      </PageContainer>
    );
    
    // Should render as div without role
    const container = screen.getByTestId('child').parentElement;
    expect(container).not.toHaveAttribute('role');
  });

});