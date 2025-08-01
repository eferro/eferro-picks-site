import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ActiveFilters } from './ActiveFilters';
import { TalksFilter } from '../../utils/TalksFilter';
import type { YearFilterData } from './YearFilter';

// Mock handlers
const mockHandlers = {
  onRemoveAuthor: vi.fn(),
  onRemoveConference: vi.fn(),
  onRemoveTopic: vi.fn(),
  onClearTopics: vi.fn(),
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

  it('renders author filter with remove button', () => {
    const filterWithAuthor = new TalksFilter({ author: 'John Doe' });
    
    render(
      <ActiveFilters
        filter={filterWithAuthor}
        yearFilter={null}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Speaker:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    const removeButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(removeButton);
    expect(mockHandlers.onRemoveAuthor).toHaveBeenCalledTimes(1);
  });

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

  it('renders topics filter with individual and clear all buttons', () => {
    const filterWithTopics = new TalksFilter({ topics: ['React', 'Testing'] });
    
    render(
      <ActiveFilters
        filter={filterWithTopics}
        yearFilter={null}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Topics:')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Clear all topics')).toBeInTheDocument();
    
    // Test individual topic removal
    const reactButton = screen.getByRole('button', { name: /react/i });
    fireEvent.click(reactButton);
    expect(mockHandlers.onRemoveTopic).toHaveBeenCalledWith('React');
    
    // Test clear all topics
    const clearAllButton = screen.getByText('Clear all topics');
    fireEvent.click(clearAllButton);
    expect(mockHandlers.onClearTopics).toHaveBeenCalledTimes(1);
  });

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
      author: 'Jane Smith',
      topics: ['React'],
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

    expect(screen.getByText('Speaker:')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Topics:')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Year:')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Has Notes')).toBeInTheDocument();
    expect(screen.getByText('Format:')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
  });
});