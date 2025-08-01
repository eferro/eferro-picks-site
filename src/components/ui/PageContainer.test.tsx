import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageContainer } from './PageContainer';

describe('PageContainer', () => {
  it('renders children with default styling', () => {
    render(
      <PageContainer>
        <div data-testid="child">Test content</div>
      </PageContainer>
    );
    
    const container = screen.getByRole('main');
    const child = screen.getByTestId('child');
    
    expect(container).toBeInTheDocument();
    expect(child).toBeInTheDocument();
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-12');
  });

  it('applies compact padding variant', () => {
    render(
      <PageContainer padding="compact">
        <div>Content</div>
      </PageContainer>
    );
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('py-8');
    expect(container).not.toHaveClass('py-12');
  });

  it('applies extended width variant', () => {
    render(
      <PageContainer width="extended">
        <div>Content</div>
      </PageContainer>
    );
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('max-w-7xl', '2xl:max-w-[96rem]');
  });

  it('combines compact padding with extended width', () => {
    render(
      <PageContainer padding="compact" width="extended">
        <div>Content</div>
      </PageContainer>
    );
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('py-8', 'max-w-7xl', '2xl:max-w-[96rem]');
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

  it('maintains consistent base classes across all variants', () => {
    render(
      <PageContainer padding="compact" width="extended" className="extra">
        <div>Content</div>
      </PageContainer>
    );
    
    const container = screen.getByRole('main');
    // Should always have these base responsive classes
    expect(container).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
  });
});