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
});
