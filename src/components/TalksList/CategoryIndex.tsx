import { useMemo } from 'react';

export interface CategoryData {
  name: string;
  count: number;
}

interface CategoryIndexProps {
  categories: CategoryData[];
  onCategoryClick: (categoryName: string) => void;
}

export function CategoryIndex({ categories, onCategoryClick }: CategoryIndexProps) {
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.count - a.count);
  }, [categories]);

  if (categories.length === 0) {
    return (
      <nav
        className="sticky top-4 bg-white rounded-lg shadow-sm p-4"
        aria-label="Category navigation"
      >
        <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
      </nav>
    );
  }

  return (
    <nav
      className="sticky top-4 bg-white rounded-lg shadow-sm p-4"
      aria-label="Category navigation"
    >
      <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
      <ul className="space-y-1">
        {sortedCategories.map((category) => (
          <li key={category.name}>
            <button
              type="button"
              onClick={() => onCategoryClick(category.name)}
              className="w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            >
              <span className="block truncate">{category.name}</span>
              <span className="text-xs text-gray-400">({category.count})</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}