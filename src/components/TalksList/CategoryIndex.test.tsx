import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoryIndex } from './CategoryIndex';

interface CategoryData {
  name: string;
  count: number;
}

describe('CategoryIndex', () => {
  const mockCategories: CategoryData[] = [
    { name: 'Engineering Culture', count: 15 },
    { name: 'Architecture', count: 12 },
    { name: 'AI', count: 8 },
    { name: 'Product', count: 5 },
  ];

  const mockOnCategoryClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render category list with counts', () => {
    render(
      <CategoryIndex
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Engineering Culture')).toBeInTheDocument();
    expect(screen.getByText('(15)')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });

  it('should call onCategoryClick when a category is clicked', () => {
    render(
      <CategoryIndex
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const categoryButton = screen.getByRole('button', { name: /engineering culture/i });
    fireEvent.click(categoryButton);

    expect(mockOnCategoryClick).toHaveBeenCalledWith('Engineering Culture');
  });

  it('should handle empty categories list', () => {
    render(
      <CategoryIndex
        categories={[]}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render a clickable entry when there is exactly one category', () => {
    render(
      <CategoryIndex
        categories={[{ name: 'Testing', count: 7 }]}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    expect(screen.getByRole('button', { name: /testing/i })).toBeInTheDocument();
    expect(screen.getByText('(7)')).toBeInTheDocument();
  });

  it('should not mutate the categories array received as prop', () => {
    const input: CategoryData[] = [
      { name: 'AI', count: 8 },
      { name: 'Engineering Culture', count: 15 },
    ];

    render(
      <CategoryIndex categories={input} onCategoryClick={mockOnCategoryClick} />
    );

    expect(input.map((c) => c.name)).toEqual(['AI', 'Engineering Culture']);
  });

  it('should re-sort when the categories prop changes', () => {
    const { rerender } = render(
      <CategoryIndex
        categories={[
          { name: 'AI', count: 8 },
          { name: 'Product', count: 5 },
        ]}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    rerender(
      <CategoryIndex
        categories={[
          { name: 'AI', count: 8 },
          { name: 'Product', count: 20 },
        ]}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const categoryButtons = screen.getAllByRole('button');
    expect(categoryButtons[0]).toHaveTextContent('Product');
    expect(categoryButtons[1]).toHaveTextContent('AI');
  });

  it('should sort categories by count descending', () => {
    const unsortedCategories: CategoryData[] = [
      { name: 'AI', count: 8 },
      { name: 'Engineering Culture', count: 15 },
      { name: 'Product', count: 5 },
      { name: 'Architecture', count: 12 },
    ];

    render(
      <CategoryIndex
        categories={unsortedCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const categoryButtons = screen.getAllByRole('button');
    expect(categoryButtons[0]).toHaveTextContent('Engineering Culture');
    expect(categoryButtons[1]).toHaveTextContent('Architecture');
    expect(categoryButtons[2]).toHaveTextContent('AI');
    expect(categoryButtons[3]).toHaveTextContent('Product');
  });

  describe('Compact layout', () => {
    it('should render name and count side by side on a single line', () => {
      render(
        <CategoryIndex
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
        />
      );

      const button = screen.getByRole('button', { name: /engineering culture/i });
      expect(button).toHaveClass('flex', 'items-baseline', 'justify-between');

      const count = screen.getByText('(15)');
      expect(count).not.toHaveClass('block');
    });
  });

  describe('Overflow handling', () => {
    it('should limit height to the viewport and scroll internally', () => {
      render(
        <CategoryIndex
          categories={mockCategories}
          onCategoryClick={mockOnCategoryClick}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('overflow-y-auto', 'max-h-[calc(100vh-2rem)]');
    });

    it('should limit height and scroll internally even when there are no categories', () => {
      render(
        <CategoryIndex
          categories={[]}
          onCategoryClick={mockOnCategoryClick}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('overflow-y-auto', 'max-h-[calc(100vh-2rem)]');
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CategoryIndex
        categories={mockCategories}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Category navigation');

    const categoryButton = screen.getByRole('button', { name: /engineering culture/i });
    expect(categoryButton).toHaveAttribute('type', 'button');
  });
});