import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  it('renders with blue variant by default', () => {
    const mockOnRemove = vi.fn();
    render(<FilterChip onRemove={mockOnRemove}>Test Filter</FilterChip>);
    
    const chip = screen.getByRole('button');
    expect(chip).toHaveClass('bg-blue-100', 'text-blue-800');
    expect(chip).toHaveTextContent('Test Filter×');
  });

  it('renders with gray variant when specified', () => {
    const mockOnRemove = vi.fn();
    render(<FilterChip variant="gray" onRemove={mockOnRemove}>Test Filter</FilterChip>);
    
    const chip = screen.getByRole('button');
    expect(chip).toHaveClass('bg-gray-100', 'text-gray-800');
    expect(chip).toHaveTextContent('Test Filter×');
  });

  it('applies correct close button styling for blue variant', () => {
    const mockOnRemove = vi.fn();
    render(<FilterChip onRemove={mockOnRemove}>Test</FilterChip>);
    
    const closeButton = screen.getByText('×');
    expect(closeButton).toHaveClass('ml-2', 'text-blue-600');
  });

  it('applies correct close button styling for gray variant', () => {
    const mockOnRemove = vi.fn();
    render(<FilterChip variant="gray" onRemove={mockOnRemove}>Test</FilterChip>);
    
    const closeButton = screen.getByText('×');
    expect(closeButton).toHaveClass('ml-2', 'text-gray-600');
  });

  it('calls onRemove when clicked', () => {
    const mockOnRemove = vi.fn();
    render(<FilterChip onRemove={mockOnRemove}>Test Filter</FilterChip>);
    
    const chip = screen.getByRole('button');
    fireEvent.click(chip);
    
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('applies aria-label when provided', () => {
    const mockOnRemove = vi.fn();
    render(
      <FilterChip onRemove={mockOnRemove} ariaLabel="Remove test filter">
        Test Filter
      </FilterChip>
    );
    
    const chip = screen.getByLabelText('Remove test filter');
    expect(chip).toBeInTheDocument();
  });

  it('sets aria-hidden on close button when aria-label is provided', () => {
    const mockOnRemove = vi.fn();
    render(
      <FilterChip onRemove={mockOnRemove} ariaLabel="Remove test filter">
        Test Filter
      </FilterChip>
    );
    
    const closeButton = screen.getByText('×');
    expect(closeButton).toHaveAttribute('aria-hidden', 'true');
  });

  it('has correct base styling classes', () => {
    const mockOnRemove = vi.fn();
    render(<FilterChip onRemove={mockOnRemove}>Test</FilterChip>);
    
    const chip = screen.getByRole('button');
    expect(chip).toHaveClass(
      'break-words',
      'inline-flex', 
      'items-center',
      'px-3',
      'py-1',
      'rounded-full',
      'text-sm'
    );
  });
});