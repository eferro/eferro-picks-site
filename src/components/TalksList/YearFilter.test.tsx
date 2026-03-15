import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { YearFilter } from './YearFilter';
import { createTalk, renderWithRouter } from '../../test/utils';

const openMenu = () => {
  const button = screen.getByRole('button');
  fireEvent.click(button);
};

describe('YearFilter', () => {
  it('renders unique years in descending order', () => {
    const talks = [
      createTalk({ year: 2022 }),
      createTalk({ year: 2024 }),
      createTalk({ year: 2023 }),
    ];

    renderWithRouter(
      <YearFilter talks={talks} selectedFilter={null} onFilterChange={() => {}} />
    );

    openMenu();

    const yearButtons = screen.getAllByRole('button', { name: /\d{4}/ });
    const years = yearButtons.map(btn => btn.textContent);
    expect(years).toEqual(['2024', '2023', '2022']);
  });

  it('calls onFilterChange for preset options', () => {
    const talks = [createTalk({ year: 2023 })];
    const onFilterChange = vi.fn();

    renderWithRouter(
      <YearFilter talks={talks} selectedFilter={null} onFilterChange={onFilterChange} />
    );

    openMenu();

    fireEvent.click(screen.getByText('Last 2 Years'));
    expect(onFilterChange).toHaveBeenCalledWith({ type: 'last2' });
  });

  it('shows label for selected filter', () => {
    const filter = { type: 'specific', year: 2023 } as const;
    renderWithRouter(
      <YearFilter talks={[]} selectedFilter={filter} onFilterChange={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Year: 2023');
  });

  describe('year arithmetic mutation tests', () => {
    it('should use correct year calculations for after filter', () => {
      // Mock the current year for deterministic testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01'));

      const onFilterChange = vi.fn();
      renderWithRouter(
        <YearFilter talks={[]} selectedFilter={null} onFilterChange={onFilterChange} />
      );

      openMenu();

      // Test "After 2019" button (2024-5=2019)
      const afterButton = screen.getByRole('menuitem', { name: /after 2019/i });
      fireEvent.click(afterButton);
      expect(onFilterChange).toHaveBeenCalledWith({ type: 'after', year: 2019 });

      vi.useRealTimers();
    });

    it('should use correct year calculations for before filter', () => {
      // Mock the current year for deterministic testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01'));

      const onFilterChange = vi.fn();
      renderWithRouter(
        <YearFilter talks={[]} selectedFilter={null} onFilterChange={onFilterChange} />
      );

      openMenu();

      // Test "Before 2019" button (2024-5=2019)
      const beforeButton = screen.getByRole('menuitem', { name: /before 2019/i });
      fireEvent.click(beforeButton);
      expect(onFilterChange).toHaveBeenCalledWith({ type: 'before', year: 2019 });

      vi.useRealTimers();
    });

    it('should display correct year labels based on current year calculation', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01'));

      renderWithRouter(
        <YearFilter talks={[]} selectedFilter={null} onFilterChange={() => {}} />
      );

      openMenu();

      // Should show "After 2021" (2026-5=2021) and "Before 2021"
      expect(screen.getByRole('menuitem', { name: /after 2021/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /before 2021/i })).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should handle boundary values in year filtering', () => {
      const talks = [
        createTalk({ year: 2022 }),
        createTalk({ year: 2023 }),
        createTalk({ year: 2024 }),
      ];
      const onFilterChange = vi.fn();

      renderWithRouter(
        <YearFilter talks={talks} selectedFilter={null} onFilterChange={onFilterChange} />
      );

      openMenu();

      // Test specific year selection - should use exact year value
      fireEvent.click(screen.getByText('2023'));
      expect(onFilterChange).toHaveBeenCalledWith({ type: 'specific', year: 2023 });
    });
  });
});
