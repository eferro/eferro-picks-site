import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { YearFilter, type YearFilterData } from './YearFilter';
import { createTalk } from '../../test/builders';

// Opening the headless-ui menu triggers an async Transition state update,
// so flush it inside act() to keep tests free of "not wrapped in act" warnings.
const openMenu = async () => {
  const button = screen.getByRole('button');
  await act(async () => {
    fireEvent.click(button);
  });
};

describe('YearFilter', () => {
  it('renders unique years in descending order', async () => {
    const talks = [
      createTalk({ year: 2022 }),
      createTalk({ year: 2024 }),
      createTalk({ year: 2023 }),
    ];

    render(
      <YearFilter talks={talks} selectedFilter={null} onFilterChange={() => {}} />
    );

    await openMenu();

    const yearButtons = screen.getAllByRole('button', { name: /\d{4}/ });
    const years = yearButtons.map(btn => btn.textContent);
    expect(years).toEqual(['2024', '2023', '2022']);
  });

  it('calls onFilterChange for preset options', async () => {
    const talks = [createTalk({ year: 2023 })];
    const onFilterChange = vi.fn();

    render(
      <YearFilter talks={talks} selectedFilter={null} onFilterChange={onFilterChange} />
    );

    await openMenu();

    fireEvent.click(screen.getByText('Last 2 Years'));
    expect(onFilterChange).toHaveBeenCalledWith({ type: 'last2' });
  });

  it('shows label for selected filter', () => {
    const filter = { type: 'specific', year: 2023 } as const;
    render(
      <YearFilter talks={[]} selectedFilter={filter} onFilterChange={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Year: 2023');
  });

  it.each([
    [{ type: 'before', year: 2020 } as const, 'Before 2020'],
    [{ type: 'after', year: 2020 } as const, 'After 2020'],
    [{ type: 'last2' } as const, 'Last 2 Years'],
    [{ type: 'last5' } as const, 'Last 5 Years'],
    [null, 'Filter by Year'],
  ])('shows the correct trigger label for %o', (filter, expectedLabel) => {
    render(
      <YearFilter talks={[]} selectedFilter={filter} onFilterChange={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveTextContent(expectedLabel);
  });

  describe('year arithmetic mutation tests', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should use correct year calculations for after filter', async () => {
      // Mid-year local date: the current year is 2024 in every timezone
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15));

      const onFilterChange = vi.fn();
      render(
        <YearFilter talks={[]} selectedFilter={null} onFilterChange={onFilterChange} />
      );

      await openMenu();

      // Test "After 2019" button (2024-5=2019)
      const afterButton = screen.getByRole('menuitem', { name: /after 2019/i });
      fireEvent.click(afterButton);
      expect(onFilterChange).toHaveBeenCalledWith({ type: 'after', year: 2019 });
    });

    it('should use correct year calculations for before filter', async () => {
      // Mid-year local date: the current year is 2024 in every timezone
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15));

      const onFilterChange = vi.fn();
      render(
        <YearFilter talks={[]} selectedFilter={null} onFilterChange={onFilterChange} />
      );

      await openMenu();

      // Test "Before 2019" button (2024-5=2019)
      const beforeButton = screen.getByRole('menuitem', { name: /before 2019/i });
      fireEvent.click(beforeButton);
      expect(onFilterChange).toHaveBeenCalledWith({ type: 'before', year: 2019 });
    });

    it('should display correct year labels based on current year calculation', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 15));

      render(
        <YearFilter talks={[]} selectedFilter={null} onFilterChange={() => {}} />
      );

      await openMenu();

      // Should show "After 2021" (2026-5=2021) and "Before 2021"
      expect(screen.getByRole('menuitem', { name: /after 2021/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /before 2021/i })).toBeInTheDocument();
    });

    it('should handle boundary values in year filtering', async () => {
      const talks = [
        createTalk({ year: 2022 }),
        createTalk({ year: 2023 }),
        createTalk({ year: 2024 }),
      ];
      const onFilterChange = vi.fn();

      render(
        <YearFilter talks={talks} selectedFilter={null} onFilterChange={onFilterChange} />
      );

      await openMenu();

      // Test specific year selection - should use exact year value
      fireEvent.click(screen.getByText('2023'));
      expect(onFilterChange).toHaveBeenCalledWith({ type: 'specific', year: 2023 });
    });
  });

  describe('preset options', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it.each<[string, YearFilterData | null]>([
      ['All Years', null],
      ['Last 2 Years', { type: 'last2' }],
      ['Last 5 Years', { type: 'last5' }],
    ])('"%s" sends the matching filter', async (label, expected) => {
      const onFilterChange = vi.fn();
      render(<YearFilter talks={[]} selectedFilter={{ type: 'specific', year: 2020 }} onFilterChange={onFilterChange} />);
      await openMenu();

      fireEvent.click(screen.getByRole('menuitem', { name: new RegExp(`^${label}`) }));

      expect(onFilterChange).toHaveBeenCalledWith(expected);
    });

    it.each<[string | null, YearFilterData | null]>([
      ['All Years', null],
      ['Last 2 Years', { type: 'last2' }],
      ['Last 5 Years', { type: 'last5' }],
      ['After 2019', { type: 'after', year: 2019 }],
      ['Before 2019', { type: 'before', year: 2019 }],
      [null, { type: 'after', year: 2010 }], // a year without a preset selects none
    ])('announces "%s" as the only selected preset', async (label, selectedFilter) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2024, 5, 15));
      render(<YearFilter talks={[]} selectedFilter={selectedFilter} onFilterChange={() => {}} />);
      await openMenu();

      const items = screen.getAllByRole('menuitem').filter(item => item.textContent?.trim());
      const selected = items.filter(item => /, selected$/.test(item.textContent ?? ''));
      if (label === null) {
        expect(selected).toHaveLength(0);
      } else {
        expect(selected).toHaveLength(1);
        expect(selected[0]).toHaveAccessibleName(new RegExp(`^${label}\\s*, selected$`));
      }
    });
  });

  describe('specific years', () => {
    it('lists only years present in the talks', async () => {
      render(
        <YearFilter
          talks={[createTalk({ year: 2021 }), createTalk({ year: undefined }), createTalk({ year: 2021 })]}
          selectedFilter={null}
          onFilterChange={() => {}}
        />
      );
      await openMenu();

      const yearButtons = within(screen.getByRole('menu')).getAllByRole('button');
      expect(yearButtons.map(b => b.textContent)).toEqual(['2021']);
    });

    it('marks the selected year as pressed', async () => {
      render(
        <YearFilter
          talks={[createTalk({ year: 2022 }), createTalk({ year: 2023 })]}
          selectedFilter={{ type: 'specific', year: 2023 }}
          onFilterChange={() => {}}
        />
      );
      await openMenu();

      expect(screen.getByRole('button', { name: '2023' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: '2022' })).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
