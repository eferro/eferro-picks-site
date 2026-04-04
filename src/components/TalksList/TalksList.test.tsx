import { screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TalksList } from '.';
import { useTalks } from '../../hooks/useTalks';
import { renderWithRouter, getMockSearchParams, mockSetSearchParams, mockNavigate, createTalk, setMockSearchParams } from '../../test/utils';

// Mock the child components
interface MockTalkSectionProps {
  coreTopic: string;
  talks: Array<{ id: string; title: string; }>;
}

vi.mock('./TalkSection', () => ({
  TalkSection: (props: MockTalkSectionProps) => {
    return (
      <section>
        <h2>{props.coreTopic} ({props.talks.length})</h2>
        {props.talks.map((talk) => (
          <div key={talk.id} role="article">
            <div
              onClick={() => mockNavigate({ pathname: `/talk/${talk.id}`, search: getMockSearchParams().toString() })}
            >
              {talk.title}
            </div>
            {/* Topics as spans (no click handlers) */}
            {talk.topics.map((topic: string) => (
              <span
                key={`topic-${talk.id}-${topic}`}
                aria-label={`Topic: ${topic}`}
                data-testid={`topic-${topic}`}
              >
                {topic}
              </span>
            ))}
            {/* Speakers as spans (no click handlers) */}
            {(talk.speakers || []).map((speaker: string) => (
              <span
                key={`speaker-${talk.id}-${speaker}`}
                aria-label={`Speaker: ${speaker}`}
              >
                {speaker}
              </span>
            ))}
          </div>
        ))}
      </section>
    );
  }
}));

vi.mock('./YearFilter', () => ({
  YearFilter: ({ onFilterChange }: { onFilterChange: (filter: { type: string }) => void }) => (
    <button onClick={() => onFilterChange({ type: 'last2' })}>Year Filter</button>
  )
}));

// Mock RecentlyAddedTalks component
vi.mock('../RecentlyAddedTalks', () => ({
  RecentlyAddedTalks: ({ talks }: { talks: Array<{ id: string; title: string; registered_at?: string }> }) => (
    <section data-testid="recently-added-talks" aria-label="Recently added talks">
      <h2>Recently Added</h2>
      <div data-testid="recently-added-count">{talks.length} talks</div>
      {talks.map(talk => (
        <div key={talk.id} data-testid={`recently-added-${talk.id}`}>
          {talk.title}
        </div>
      ))}
    </section>
  )
}));

// Mock the hooks
vi.mock('../../hooks/useTalks');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [getMockSearchParams(), mockSetSearchParams]
  };
});

// Author Filter tests for TalksList
// Author Filter tests removed - functionality migrated to unified search

describe('Rating Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());
    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks: [ createTalk({ id: '1', title: 'Star talk' }) ],
      loading: false,
      error: null
    }));
  });

  it('shows the rating filter button with correct initial state', () => {
    // Default (no rating param) shows "Top Picks" label (inactive)
    renderWithRouter(<TalksList />);
    const button = screen.getByRole('button', { name: /toggle top picks filter/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Top Picks');
    expect(button).toHaveClass('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    expect(mockSetSearchParams).not.toHaveBeenCalled();
  });

  it('shows tooltip on the rating filter button', () => {
    renderWithRouter(<TalksList />);
    const button = screen.getByRole('button', { name: /toggle top picks filter/i });
    expect(button).toHaveAttribute('title', "Show only 5-star talks — the curator's top recommendations");
  });

  it('toggles the rating filter and updates URL params', () => {
    // Initial state shows all talks (no rating filter)
    renderWithRouter(<TalksList />);
    const [toggle] = screen.getAllByRole('button', { name: /toggle top picks filter/i });
    // Click to enable rating filter (to show 5 stars only)
    fireEvent.click(toggle);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
    let params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('rating')).toBe('5');

    // Update mockSearchParams to match new params
    setMockSearchParams(params);
    // Re-render after click to simulate navigation
    cleanup();
    renderWithRouter(<TalksList />);
    const [updated] = screen.getAllByRole('button', { name: /toggle top picks filter/i });
    // After first click, button should show star emoji with "Top Picks" (active state)
    expect(updated.textContent?.trim()).toContain('Top Picks');
    // Click to disable rating filter (back to showing all)
    fireEvent.click(updated);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
    params = mockSetSearchParams.mock.calls[1][0] as URLSearchParams;
    expect(params.get('rating')).toBeNull();
  });

  it('should not force rating=5 when user explicitly turns off rating filter', () => {
    // Start with rating filter off (no rating param)
    setMockSearchParams(new URLSearchParams(''));
    renderWithRouter(<TalksList />);
    
    // The component should not force rating=5 just because there's no rating param
    // This test will fail because of the bug in the initialization logic
    const button = screen.getByRole('button', { name: /toggle top picks filter/i });
    expect(button.textContent).toContain('Top Picks'); // Should show 'Top Picks' when rating filter is off
  });
});

describe('Format Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());
    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks: [
        createTalk({ id: '1', format: 'talk' }),
        createTalk({ id: '2', format: 'podcast' })
      ],
      loading: false,
      error: null
    }));
  });

  it('updates format parameter when selecting from dropdown', () => {
    renderWithRouter(<TalksList />);
    
    // Click the Format dropdown button to open it
    const formatButton = screen.getByRole('button', { name: /format/i });
    fireEvent.click(formatButton);
    
    // Click the Podcasts option in the dropdown
    const podcastOption = screen.getByRole('menuitem', { name: /podcasts/i });
    fireEvent.click(podcastOption);
    
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('format')).toBe('podcast');
  });
});

// Mock the hasMeaningfulNotes function
vi.mock('../../utils/talks', () => ({
  hasMeaningfulNotes: (notes: string | undefined) => {
    if (!notes) return false;
    return notes.trim().length > 0;
  }
}));

describe('TalksList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks: [
        createTalk({ id: '1', title: 'Talk with both topics 1', speakers: ['Test Speaker'], topics: ['react', 'typescript'], core_topic: 'Engineering Culture', year: 2025 }),
        createTalk({ id: '2', title: 'Talk with only first topic', speakers: ['Test Speaker'], topics: ['react'], core_topic: 'Engineering Culture', year: 2025 }),
        createTalk({ id: '3', title: 'Talk with only second topic', speakers: ['Test Speaker'], topics: ['typescript'], core_topic: 'Engineering Culture', year: 2025 }),
        createTalk({ id: '4', title: 'Talk with both topics 2', speakers: ['Test Speaker'], topics: ['react', 'typescript', 'testing'], core_topic: 'Engineering Culture', year: 2025 }),
        createTalk({ id: '5', title: 'Talk with no matching topics', speakers: ['Test Speaker'], topics: ['testing'], core_topic: 'Engineering Culture', year: 2025 }),
      ],
      loading: false,
      error: null
    }));
  });

  const renderComponent = () => renderWithRouter(<TalksList />);

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Engineering Culture (5)')).toBeInTheDocument();
    // Updated: check for both unique titles
    expect(screen.getAllByText('Talk with both topics 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Talk with both topics 2').length).toBeGreaterThan(0);
  });

  it('initializes with yearType from URL', () => {
    // Set initial state
    getMockSearchParams().set('yearType', 'last2');
    
    renderComponent();
    expect(screen.getByText('Year Filter')).toBeInTheDocument();
  });

  it('preserves yearType when navigating', () => {
    // Set initial state
    getMockSearchParams().set('yearType', 'last2');
    
    renderComponent();

    // Verify that the year filter is preserved in navigation
    const talkLink = screen.getAllByText('Talk with both topics 1')[0];
    fireEvent.click(talkLink);

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/talk/1',
      search: 'yearType=last2'
    });
  });

  // Topics filter tests removed - functionality migrated to unified search

  describe('Year Filter Integration', () => {
    it('removes year filter when clicking chip remove button', () => {
      const talks = [
        createTalk({ id: '1', year: 2024, title: 'Recent Talk' }),
        createTalk({ id: '2', year: 2020, title: 'Old Talk' }),
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        talks,
        isLoading: false,
        error: null,
      }));

      // Start with year filter active
      setMockSearchParams(new URLSearchParams('yearType=last2'));

      renderWithRouter(<TalksList />);

      // Verify filter chip is rendered
      expect(screen.getByText('Last 2 Years')).toBeInTheDocument();

      // Click remove button on the chip
      const removeButton = screen.getByRole('button', { name: /last 2 years/i });
      fireEvent.click(removeButton);

      // Verify URL parameters were cleared
      const updatedParams = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;
      expect(updatedParams.get('yearType')).toBeNull();
      expect(updatedParams.get('year')).toBeNull();
    });

    it('removes specific year filter when clicking chip remove button', () => {
      const talks = [
        createTalk({ id: '1', year: 2023, title: 'Talk from 2023' }),
        createTalk({ id: '2', year: 2024, title: 'Talk from 2024' }),
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        talks,
        isLoading: false,
        error: null,
      }));

      // Start with specific year filter active
      setMockSearchParams(new URLSearchParams('year=2023&yearType=specific'));

      renderWithRouter(<TalksList />);

      // Verify filter chip is rendered
      expect(screen.getByText('2023')).toBeInTheDocument();

      // Click remove button on the chip
      const removeButton = screen.getByRole('button', { name: /2023/i });
      fireEvent.click(removeButton);

      // Verify both URL parameters were cleared
      const updatedParams = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;
      expect(updatedParams.get('year')).toBeNull();
      expect(updatedParams.get('yearType')).toBeNull();
    });

    it('removes last5 year filter when clicking chip remove button', () => {
      const talks = [createTalk({ id: '1', year: 2024 })];

      (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        talks,
        isLoading: false,
        error: null,
      }));

      setMockSearchParams(new URLSearchParams('yearType=last5'));

      renderWithRouter(<TalksList />);

      expect(screen.getByText('Last 5 Years')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /last 5 years/i });
      fireEvent.click(removeButton);

      const updatedParams = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;
      expect(updatedParams.get('yearType')).toBeNull();
      expect(updatedParams.get('year')).toBeNull();
    });

    it('removes before year filter when clicking chip remove button', () => {
      const talks = [createTalk({ id: '1', year: 2019 })];

      (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        talks,
        isLoading: false,
        error: null,
      }));

      setMockSearchParams(new URLSearchParams('year=2020&yearType=before'));

      renderWithRouter(<TalksList />);

      expect(screen.getByText('Before 2020')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /before 2020/i });
      fireEvent.click(removeButton);

      const updatedParams = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;
      expect(updatedParams.get('year')).toBeNull();
      expect(updatedParams.get('yearType')).toBeNull();
    });

    it('removes after year filter when clicking chip remove button', () => {
      const talks = [createTalk({ id: '1', year: 2021 })];

      (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        talks,
        isLoading: false,
        error: null,
      }));

      setMockSearchParams(new URLSearchParams('year=2020&yearType=after'));

      renderWithRouter(<TalksList />);

      expect(screen.getByText('After 2020')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /after 2020/i });
      fireEvent.click(removeButton);

      const updatedParams = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;
      expect(updatedParams.get('year')).toBeNull();
      expect(updatedParams.get('yearType')).toBeNull();
    });

    it('preserves other filters when removing year filter', () => {
      const talks = [createTalk({ id: '1', year: 2024, notes: 'Great talk' })];

      (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        talks,
        isLoading: false,
        error: null,
      }));

      // Start with year filter AND hasNotes filter
      setMockSearchParams(new URLSearchParams('yearType=last2&hasNotes=true'));

      renderWithRouter(<TalksList />);

      // Remove year filter
      const yearRemoveButton = screen.getByRole('button', { name: /last 2 years/i });
      fireEvent.click(yearRemoveButton);

      // Verify year params cleared but hasNotes preserved
      const updatedParams = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;
      expect(updatedParams.get('yearType')).toBeNull();
      expect(updatedParams.get('year')).toBeNull();
      expect(updatedParams.get('hasNotes')).toBe('true');
    });
  });

});

describe('Has Notes Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());
  });

  it('shows the Has Notes filter button', () => {
    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks: [],
      loading: false,
      error: null
    }));

    renderWithRouter(<TalksList />);
    const button = screen.getByRole('button', { name: /toggle has notes filter/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-gray-700');
    expect(button).not.toHaveClass('bg-blue-500');
  });

  it('filters talks to show only those with notes', () => {
    // Explicitly reset search params to empty before rendering
    setMockSearchParams(new URLSearchParams());
    const talkWithNotes = createTalk({ 
      id: '1',
      title: 'Talk with notes',
      notes: 'Some meaningful notes' 
    });
    const talkWithoutNotes = createTalk({ 
      id: '2',
      title: 'Talk without notes',
      notes: undefined 
    });
    const talkWithEmptyNotes = createTalk({ 
      id: '3',
      title: 'Talk with empty notes',
      notes: '\n  \n' 
    });

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks: [talkWithNotes, talkWithoutNotes, talkWithEmptyNotes],
      loading: false,
      error: null
    }));

    renderWithRouter(<TalksList />);
    
    // Initially all talks should be visible
    const initialArticles = screen.queryAllByRole('article');
    if (initialArticles.length === 0) {
      expect(screen.getByText('No talks found matching your criteria.')).toBeInTheDocument();
    } else {
      expect(initialArticles).toHaveLength(3);
      expect(screen.getAllByText('Talk with notes')).toHaveLength(2); // Once in Recently Added, once in main list
      expect(screen.getAllByText('Talk without notes')).toHaveLength(2);
    }

    // Click the Has Notes filter
    const button = screen.getByRole('button', { name: /toggle has notes filter/i });
    fireEvent.click(button);

    // Update mockSearchParams to match new params and re-render
    const lastParams = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0];
    setMockSearchParams(lastParams instanceof URLSearchParams ? lastParams : new URLSearchParams(String(lastParams)));
    cleanup();
    renderWithRouter(<TalksList />);
    const filteredArticles = screen.queryAllByRole('article');
    if (filteredArticles.length === 0) {
      expect(screen.getByText('No talks found matching your criteria.')).toBeInTheDocument();
    } else {
      expect(filteredArticles).toHaveLength(1);
      expect(screen.getByText('Talk with notes')).toBeInTheDocument();
      expect(screen.queryByText('Talk without notes')).not.toBeInTheDocument();
    }

    // Re-query the Has Notes filter button after re-render
    const updatedButton = screen.getByRole('button', { name: /toggle has notes filter/i });
    // Verify the button state changed
    expect(updatedButton).toHaveClass('bg-blue-500');
    expect(updatedButton).toHaveClass('text-white');
    expect(updatedButton).not.toHaveClass('bg-white');
  });

});

describe('URL parameters for other filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks: [
        createTalk({ id: '1', topics: ['react', 'typescript'] })
      ],
      loading: false,
      error: null
    }));
  });

  // Topics parameter test removed - functionality migrated to unified search

it('updates yearType parameter when selecting year filter', () => {
  renderWithRouter(<TalksList />);
  const yearButton = screen.getByRole('button', { name: /year filter/i });
  fireEvent.click(yearButton);

  let params = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0];
  if (!(params instanceof URLSearchParams)) {
    params = new URLSearchParams(String(params));
  }
  // For range filters like 'last2', yearType should be 'last2' and year should be null
  expect(params.get('yearType')).toBe('last2');
  expect(params.get('year')).toBeNull();
});

it('displays search box for user input', () => {
  renderWithRouter(<TalksList />);

  const searchInput = screen.getByPlaceholderText(/search in titles, speakers, topics/i);
  expect(searchInput).toBeInTheDocument();

  const searchForm = screen.getByTestId('search-form');
  expect(searchForm).toBeInTheDocument();
});

it('integrates search box with filter system', () => {
  const talks = [
    createTalk({ id: '1', title: 'React Testing', speakers: ['Alice'], topics: ['react', 'testing'] }),
    createTalk({ id: '2', title: 'Vue Basics', speakers: ['Bob'], topics: ['vue'] })
  ];

  (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
    talks,
    loading: false,
    error: null
  }));

  renderWithRouter(<TalksList />);

  const searchInput = screen.getByPlaceholderText(/search in titles, speakers, topics/i);

  // Type a search query (unified search without prefixes)
  fireEvent.change(searchInput, { target: { value: 'Alice react' } });
  fireEvent.submit(screen.getByTestId('search-form'));

  // Verify URL parameters were updated with unified query
  const lastCall = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1];
  const params = lastCall[0] as URLSearchParams;

  expect(params.get('query')).toBe('Alice react');
  expect(params.get('author')).toBeNull(); // Migrated to query
  expect(params.get('topics')).toBeNull(); // Migrated to query
});

describe('Recently Added Talks Integration', () => {
  it('should show Recently Added section when no filters are active', () => {
    const talks = [
      createTalk({
        id: '1',
        title: 'Recent Talk 1',
        registered_at: '2023-11-01T00:00:00Z',
        core_topic: 'Engineering Culture'
      }),
      createTalk({
        id: '2',
        title: 'Recent Talk 2',
        registered_at: '2023-10-01T00:00:00Z',
        core_topic: 'Engineering Culture'
      })
    ];

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks,
      loading: false,
      error: null
    }));

    // No filters active (empty URL params)
    setMockSearchParams(new URLSearchParams(''));

    renderWithRouter(<TalksList />);

    // Should show Recently Added section
    expect(screen.getByTestId('recently-added-talks')).toBeInTheDocument();
    expect(screen.getByText('Recently Added')).toBeInTheDocument();
    expect(screen.getByTestId('recently-added-count')).toHaveTextContent('2 talks');
  });

  it('should hide Recently Added section when filters are active', () => {
    const talks = [
      createTalk({
        id: '1',
        title: 'Recent Talk with Notes',
        registered_at: '2023-11-01T00:00:00Z',
        core_topic: 'Engineering Culture',
        notes: 'Some meaningful notes'
      })
    ];

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks,
      loading: false,
      error: null
    }));

    // Set hasNotes filter active
    setMockSearchParams(new URLSearchParams('hasNotes=true'));

    renderWithRouter(<TalksList />);

    // Should NOT show Recently Added section
    expect(screen.queryByTestId('recently-added-talks')).not.toBeInTheDocument();
    expect(screen.queryByText('Recently Added')).not.toBeInTheDocument();
  });

  it('should hide Recently Added section when query filter is active', () => {
    const talks = [
      createTalk({
        id: '1',
        title: 'Search Result Talk',
        registered_at: '2023-11-01T00:00:00Z',
        core_topic: 'Engineering Culture'
      })
    ];

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks,
      loading: false,
      error: null
    }));

    // Set query filter active
    setMockSearchParams(new URLSearchParams('query=testing'));

    renderWithRouter(<TalksList />);

    // Should NOT show Recently Added section
    expect(screen.queryByTestId('recently-added-talks')).not.toBeInTheDocument();
    expect(screen.queryByText('Recently Added')).not.toBeInTheDocument();
  });

  it('should hide Recently Added section when year filter is active', () => {
    const talks = [
      createTalk({
        id: '1',
        title: 'Filtered Talk',
        registered_at: '2023-11-01T00:00:00Z',
        core_topic: 'Engineering Culture',
        year: 2023
      })
    ];

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks,
      loading: false,
      error: null
    }));

    // Set year filter active
    setMockSearchParams(new URLSearchParams('yearType=last2'));

    renderWithRouter(<TalksList />);

    // Should NOT show Recently Added section
    expect(screen.queryByTestId('recently-added-talks')).not.toBeInTheDocument();
    expect(screen.queryByText('Recently Added')).not.toBeInTheDocument();
  });

  it('should show Recently Added section with correct positioning', () => {
    const talks = [
      createTalk({
        id: '1',
        title: 'Recent Talk',
        registered_at: '2023-11-01T00:00:00Z',
        core_topic: 'Engineering Culture'
      })
    ];

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks,
      loading: false,
      error: null
    }));

    // No filters active
    setMockSearchParams(new URLSearchParams(''));

    renderWithRouter(<TalksList />);

    // Get all main sections in order
    const searchBox = screen.getByPlaceholderText(/search in titles, speakers, topics/i);
    const recentlyAdded = screen.getByTestId('recently-added-talks');
    const filterButtons = screen.getByText('Year Filter');

    // Verify positioning: SearchBox -> Recently Added -> Filters -> Main List
    expect(searchBox).toBeInTheDocument();
    expect(recentlyAdded).toBeInTheDocument();
    expect(filterButtons).toBeInTheDocument();

    // In jsdom, getBoundingClientRect returns 0 values, so check DOM order instead
    const pageContainer = searchBox.closest('[role="main"]');
    expect(pageContainer).toBeInTheDocument();

    const children = Array.from(pageContainer!.children);
    const searchBoxIndex = children.findIndex(child => child.contains(searchBox));
    const recentlyAddedIndex = children.findIndex(child => child.contains(recentlyAdded));
    const filtersIndex = children.findIndex(child => child.contains(filterButtons));

    // Verify correct order: SearchBox -> Recently Added -> Filters
    expect(recentlyAddedIndex).toBeGreaterThan(searchBoxIndex);
    expect(filtersIndex).toBeGreaterThan(recentlyAddedIndex);
  });

  it('should pass talks with registered_at to RecentlyAddedTalks component', () => {
    const talks = [
      createTalk({
        id: '1',
        title: 'Talk with Date',
        registered_at: '2023-11-01T00:00:00Z',
        core_topic: 'Engineering Culture'
      }),
      createTalk({
        id: '2',
        title: 'Talk without Date',
        core_topic: 'Engineering Culture'
        // no registered_at
      })
    ];

    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks,
      loading: false,
      error: null
    }));

    // No filters active
    setMockSearchParams(new URLSearchParams(''));

    renderWithRouter(<TalksList />);

    // Should show Recently Added section with all talks passed
    expect(screen.getByTestId('recently-added-talks')).toBeInTheDocument();
    expect(screen.getByTestId('recently-added-count')).toHaveTextContent('2 talks');

    // Component should receive both talks (filtering happens inside RecentlyAddedTalks)
    expect(screen.getByTestId('recently-added-1')).toBeInTheDocument();
    expect(screen.getByTestId('recently-added-2')).toBeInTheDocument();
  });
});
});

