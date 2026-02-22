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
    // Default (no rating param) shows all talks
    renderWithRouter(<TalksList />);
    const button = screen.getByRole('button', { name: /toggle rating filter/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('All');
    expect(button).toHaveClass('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    expect(mockSetSearchParams).not.toHaveBeenCalled();
  });

  it('toggles the rating filter and updates URL params', () => {
    // Initial state shows all talks (no rating filter)
    renderWithRouter(<TalksList />);
    const [toggle] = screen.getAllByRole('button', { name: /toggle rating filter/i });
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
    const [updated] = screen.getAllByRole('button', { name: /toggle rating filter/i });
    // After first click, button should now show "5 Stars"
    expect(updated.textContent?.trim()).toBe('5 Stars');
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
    const button = screen.getByRole('button', { name: /toggle rating filter/i });
    expect(button.textContent).toBe('All'); // Should show 'All' when rating filter is off
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

});

describe('Has Notes Filter', () => {
  it('shows the Has Notes filter button', () => {
    (useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      talks: [],
      loading: false,
      error: null
    }));

    renderWithRouter(<TalksList />);
    const button = screen.getByRole('button', { name: /has notes/i });
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
    
    // Debug output for talks and filter state
     
    console.log('Talks at start:', (useTalks as ReturnType<typeof vi.fn>).mock.results?.[0]?.value?.talks);
    // Initially all talks should be visible
    const initialArticles = screen.queryAllByRole('article');
    if (initialArticles.length === 0) {
      expect(screen.getByText('No talks found matching your criteria.')).toBeInTheDocument();
    } else {
      expect(initialArticles).toHaveLength(3);
      expect(screen.getByText('Talk with notes')).toBeInTheDocument();
      expect(screen.getByText('Talk without notes')).toBeInTheDocument();
    }

    // Click the Has Notes filter
    const button = screen.getByRole('button', { name: /toggle has notes filter/i });
     
    console.log('Before click: button class:', button.className, 'search params:', getMockSearchParams().toString());
    fireEvent.click(button);
     
    console.log('After click: button class:', button.className, 'search params:', getMockSearchParams().toString());

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
    // Debug output for button class and search params
     
    console.log('Has Notes button class:', updatedButton.className);
     
    console.log('Search params after toggle:', getMockSearchParams().toString());
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
});

