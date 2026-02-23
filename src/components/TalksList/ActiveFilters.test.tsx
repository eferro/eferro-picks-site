import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ActiveFilters } from './ActiveFilters';
import { TalksFilter } from '../../utils/TalksFilter';
import type { YearFilterData } from './YearFilter';

// Mock handlers
const mockHandlers = {
  onRemoveConference: vi.fn(),
  onRemoveYearFilter: vi.fn(),
  onRemoveHasNotes: vi.fn(),
  onRemoveRating: vi.fn(),
  onRemoveFormat: vi.fn(),
};

describe('ActiveFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no filters are active', () => {
    const emptyFilter = new TalksFilter();
    const { container } = render(
      <ActiveFilters
        filter={emptyFilter}
        yearFilter={null}
        {...mockHandlers}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  // Author filter test removed - functionality migrated to unified search

  it('renders conference filter with remove button', () => {
    const filterWithConference = new TalksFilter({ conference: 'React Conf' });
    
    render(
      <ActiveFilters
        filter={filterWithConference}
        yearFilter={null}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Conference:')).toBeInTheDocument();
    expect(screen.getByText('React Conf')).toBeInTheDocument();
    
    const removeButton = screen.getByRole('button', { name: /react conf/i });
    fireEvent.click(removeButton);
    expect(mockHandlers.onRemoveConference).toHaveBeenCalledTimes(1);
  });

  // Topics filter test removed - functionality migrated to unified search

  it('renders year filter for specific year', () => {
    const emptyFilter = new TalksFilter();
    const yearFilter: YearFilterData = { type: 'specific', year: 2023 };
    
    render(
      <ActiveFilters
        filter={emptyFilter}
        yearFilter={yearFilter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Year:')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    
    const removeButton = screen.getByRole('button', { name: /2023/i });
    fireEvent.click(removeButton);
    expect(mockHandlers.onRemoveYearFilter).toHaveBeenCalledTimes(1);
  });

  it('renders year filter for "last2" type', () => {
    const emptyFilter = new TalksFilter();
    const yearFilter: YearFilterData = { type: 'last2', year: null };

    render(
      <ActiveFilters
        filter={emptyFilter}
        yearFilter={yearFilter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Last 2 Years')).toBeInTheDocument();
  });

  it('calls onRemoveYearFilter when clicking last2 year filter chip', () => {
    const emptyFilter = new TalksFilter();
    const yearFilter: YearFilterData = { type: 'last2', year: null };

    render(
      <ActiveFilters
        filter={emptyFilter}
        yearFilter={yearFilter}
        {...mockHandlers}
      />
    );

    const removeButton = screen.getByRole('button', { name: /last 2 years/i });
    fireEvent.click(removeButton);

    expect(mockHandlers.onRemoveYearFilter).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveYearFilter when clicking last5 year filter chip', () => {
    const emptyFilter = new TalksFilter();
    const yearFilter: YearFilterData = { type: 'last5', year: null };

    render(
      <ActiveFilters
        filter={emptyFilter}
        yearFilter={yearFilter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Last 5 Years')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /last 5 years/i });
    fireEvent.click(removeButton);

    expect(mockHandlers.onRemoveYearFilter).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveYearFilter when clicking before year filter chip', () => {
    const emptyFilter = new TalksFilter();
    const yearFilter: YearFilterData = { type: 'before', year: 2020 };

    render(
      <ActiveFilters
        filter={emptyFilter}
        yearFilter={yearFilter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Before 2020')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /before 2020/i });
    fireEvent.click(removeButton);

    expect(mockHandlers.onRemoveYearFilter).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveYearFilter when clicking after year filter chip', () => {
    const emptyFilter = new TalksFilter();
    const yearFilter: YearFilterData = { type: 'after', year: 2020 };

    render(
      <ActiveFilters
        filter={emptyFilter}
        yearFilter={yearFilter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('After 2020')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /after 2020/i });
    fireEvent.click(removeButton);

    expect(mockHandlers.onRemoveYearFilter).toHaveBeenCalledTimes(1);
  });

  it('renders hasNotes filter with remove button', () => {
    const filterWithNotes = new TalksFilter({ hasNotes: true });
    
    render(
      <ActiveFilters
        filter={filterWithNotes}
        yearFilter={null}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Has Notes')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Has Notes filter')).toBeInTheDocument();
    
    const removeButton = screen.getByLabelText('Remove Has Notes filter');
    fireEvent.click(removeButton);
    expect(mockHandlers.onRemoveHasNotes).toHaveBeenCalledTimes(1);
  });

  it('renders rating filter with remove button', () => {
    const filterWithRating = new TalksFilter({ rating: 5 });
    
    render(
      <ActiveFilters
        filter={filterWithRating}
        yearFilter={null}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('5 Stars')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Rating filter')).toBeInTheDocument();
    
    const removeButton = screen.getByLabelText('Remove Rating filter');
    fireEvent.click(removeButton);
    expect(mockHandlers.onRemoveRating).toHaveBeenCalledTimes(1);
  });

  it('renders format filters with remove buttons', () => {
    const filterWithFormats = new TalksFilter({ formats: ['video', 'podcast'] });
    
    render(
      <ActiveFilters
        filter={filterWithFormats}
        yearFilter={null}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Format:')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Podcast')).toBeInTheDocument();
    
    const videoButton = screen.getByRole('button', { name: /video/i });
    fireEvent.click(videoButton);
    expect(mockHandlers.onRemoveFormat).toHaveBeenCalledWith('video');
  });

  it('renders multiple active filters together', () => {
    const complexFilter = new TalksFilter({
      hasNotes: true,
      formats: ['video']
    });
    const yearFilter: YearFilterData = { type: 'specific', year: 2023 };

    render(
      <ActiveFilters
        filter={complexFilter}
        yearFilter={yearFilter}
        {...mockHandlers}
      />
    );

    // Check remaining filters (author and topics removed)
    expect(screen.getByText('Year:')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Has Notes')).toBeInTheDocument();
    expect(screen.getByText('Format:')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
  });
});