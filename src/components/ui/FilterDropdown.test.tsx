import { render, screen, fireEvent } from '@testing-library/react';
import { FilterDropdown, FilterOption } from './FilterDropdown';

const mockOptions: FilterOption[] = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' }
];

describe('FilterDropdown', () => {
  it('renders with correct label', () => {
    render(
      <FilterDropdown
        label="Topics"
        selectedValues={[]}
        options={mockOptions}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Topics')).toBeInTheDocument();
  });

  it('shows selected count in label when items are selected', () => {
    render(
      <FilterDropdown
        label="Topics"
        selectedValues={['react', 'typescript']}
        options={mockOptions}
        onChange={() => {}}
        allowMultiple={true}
      />
    );

    expect(screen.getByText('Topics (2)')).toBeInTheDocument();
  });

  it('shows single selected item in label when allowMultiple is false', () => {
    render(
      <FilterDropdown
        label="Format"
        selectedValues={['react']}
        options={mockOptions}
        onChange={() => {}}
        allowMultiple={false}
      />
    );

    expect(screen.getByText('Format: React')).toBeInTheDocument();
  });

  it('calls onChange when option is clicked', () => {
    const mockOnChange = vi.fn();
    render(
      <FilterDropdown
        label="Topics"
        selectedValues={[]}
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('Topics'));
    
    // Click option
    fireEvent.click(screen.getByText('React'));

    expect(mockOnChange).toHaveBeenCalledWith(['react']);
  });

  it('shows Clear All option when allowMultiple and showClearAll are true', () => {
    render(
      <FilterDropdown
        label="Topics"
        selectedValues={['react']}
        options={mockOptions}
        onChange={() => {}}
        allowMultiple={true}
        showClearAll={true}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('Topics: React'));
    
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('shows Any option when showAnyOption is true', () => {
    render(
      <FilterDropdown
        label="Format"
        selectedValues={[]}
        options={mockOptions}
        onChange={() => {}}
        showAnyOption={true}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('Format'));
    
    expect(screen.getByText('Any')).toBeInTheDocument();
  });
});