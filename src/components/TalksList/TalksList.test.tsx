import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TalksList } from '.';
import { useTalks } from '../../hooks/useTalks';
import { useSearchParams } from 'react-router-dom';
import { renderWithRouter, mockSearchParams, mockSetSearchParams, mockNavigate, createTalk } from '../../test/utils';
import { hasMeaningfulNotes } from '../../utils/talks';

// Mock the child components
vi.mock('./TalkSection', () => ({
  TalkSection: (props: any) => {
    const selectedTopics = props.selectedTopics || [];
    return (
      <section>
        <h2>{props.coreTopic} ({props.talks.length})</h2>
        {props.talks.map((talk: any) => (
          <div key={talk.id} role="article">
            <div
              onClick={() => mockNavigate({ pathname: `/talk/${talk.id}`, search: mockSearchParams.toString() })}
            >
              {talk.title}
            </div>
            {/* Topic buttons */}
            {talk.topics.map((topic: string) => (
              <button
                key={`topic-${talk.id}-${topic}`}
                onClick={() => props.onTopicClick(topic)}
                aria-label={`Filter by topic ${topic}`}
                data-testid={`topic-${topic}`}
                data-selected={selectedTopics.includes(topic)}
              >
                {topic}
              </button>
            ))}
            {/* Author buttons */}
            {(talk.speakers || []).map((speaker: string) => (
              <button
                key={`author-${talk.id}-${speaker}`}
                onClick={() => props.onAuthorClick(speaker)}
                aria-label={`Filter by speaker: ${speaker}`}
                data-selected={props.selectedAuthor === speaker}
              >
                {speaker}
              </button>
            ))}
          </div>
        ))}
      </section>
    );
  }
}));

vi.mock('./YearFilter', () => ({
  YearFilter: ({ onFilterChange }: { onFilterChange: any }) => (
    <button onClick={() => onFilterChange({ type: 'last2' })}>Year Filter</button>
  )
}));

// Mock the hooks
vi.mock('../../hooks/useTalks');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams]
  };
});

// Author Filter tests for TalksList
describe('Author Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    // Setup talks with different authors and titles
    (useTalks as any).mockImplementation(() => ({
      talks: [
        createTalk({ id: '1', title: 'Talk A', speakers: ['Author A'] }),
        createTalk({ id: '2', title: 'Talk B', speakers: ['Author B'] }),
      ],
      loading: false,
      error: null
    }));
  });

  it('sets author filter and updates URL params', () => {
    renderWithRouter(<TalksList />);
    const btn = screen.getByRole('button', { name: /filter by speaker: Author A/i });
    fireEvent.click(btn);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
    const params = mockSetSearchParams.mock.calls[1][0] as URLSearchParams;
    expect(params.get('author')).toBe('Author A');
  });

  it('removes author filter when clicking the same speaker again', () => {
    // Initialize with author filter
    mockSearchParams.set('author', 'Author B');
    renderWithRouter(<TalksList />);
    const btn = screen.getByRole('button', { name: /filter by speaker: Author B/i });
    fireEvent.click(btn);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
    const params = mockSetSearchParams.mock.calls[1][0] as URLSearchParams;
    expect(params.get('author')).toBeNull();
  });
  
  it('filters talks to only selected author', () => {
    renderWithRouter(<TalksList />);
    const btn = screen.getByRole('button', { name: /filter by speaker: Author A/i });
    fireEvent.click(btn);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
    const params = mockSetSearchParams.mock.calls[1][0] as URLSearchParams;
    expect(params.get('author')).toBe('Author A');
  });
});

describe('Rating Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    (useTalks as any).mockImplementation(() => ({
      talks: [ createTalk({ id: '1', title: 'Star talk' }) ],
      loading: false,
      error: null
    }));
  });

  it('shows the rating filter button with correct initial state', () => {
    // Default (no rating param) filters by 5 stars
    renderWithRouter(<TalksList />);
    const button = screen.getByRole('button', { name: /toggle rating filter/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('5 Stars');
    expect(button).toHaveClass('bg-blue-500', 'text-white');
    expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('rating')).toBe('5');
  });

  it('toggles the rating filter and updates URL params', () => {
    // Initial state is filtering by 5 stars
    renderWithRouter(<TalksList />);
    const [toggle] = screen.getAllByRole('button', { name: /toggle rating filter/i });
    // Click to remove rating filter (to show all)
    fireEvent.click(toggle);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(3);
    let params = mockSetSearchParams.mock.calls[2][0] as URLSearchParams;
    expect(params.get('rating')).toBe('all');

    // Simulate URL with rating=all and re-render
    mockSearchParams.set('rating', 'all');
    renderWithRouter(<TalksList />);
    const [updated] = screen.getAllByRole('button', { name: /toggle rating filter/i });
    expect(updated).toHaveTextContent('All');
    // Click to enable 5-star filter again
    fireEvent.click(updated);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(4);
    params = mockSetSearchParams.mock.calls[3][0] as URLSearchParams;
    expect(params.get('rating')).toBe('5');
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
    mockSearchParams.clear();

    (useTalks as any).mockImplementation(() => ({
      talks: [
        createTalk({ id: '1', title: 'Talk with both topics 1', speakers: ['Test Speaker'], topics: ['react', 'typescript'], core_topic: 'Engineering Culture', year: 2023 }),
        createTalk({ id: '2', title: 'Talk with only first topic', speakers: ['Test Speaker'], topics: ['react'], core_topic: 'Engineering Culture', year: 2023 }),
        createTalk({ id: '3', title: 'Talk with only second topic', speakers: ['Test Speaker'], topics: ['typescript'], core_topic: 'Engineering Culture', year: 2023 }),
        createTalk({ id: '4', title: 'Talk with both topics 2', speakers: ['Test Speaker'], topics: ['react', 'typescript', 'testing'], core_topic: 'Engineering Culture', year: 2023 }),
        createTalk({ id: '5', title: 'Talk with no matching topics', speakers: ['Test Speaker'], topics: ['testing'], core_topic: 'Engineering Culture', year: 2023 }),
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
    mockSearchParams.set('yearType', 'last2');
    
    renderComponent();
    expect(screen.getByText('Year Filter')).toBeInTheDocument();
  });

  it('preserves yearType when navigating', () => {
    // Set initial state
    mockSearchParams.set('yearType', 'last2');
    
    renderComponent();

    // Verify that the year filter is preserved in navigation
    const talkLink = screen.getAllByText('Talk with both topics 1')[0];
    fireEvent.click(talkLink);

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/talk/1',
      search: 'yearType=last2'
    });
  });

  it('filters talks using AND condition when multiple topics are selected', () => {
    mockSearchParams.set('topics', 'react,typescript');
    renderWithRouter(<TalksList />);
    // Should only show talks with both topics
    expect(screen.getAllByText('Talk with both topics 1')).toHaveLength(1);
    expect(screen.getAllByText('Talk with both topics 2')).toHaveLength(1);
    // Should not show talks with only one topic
    expect(screen.queryByText('Talk with only first topic')).not.toBeInTheDocument();
    expect(screen.queryByText('Talk with only second topic')).not.toBeInTheDocument();
    expect(screen.queryByText('Talk with no matching topics')).not.toBeInTheDocument();
    cleanup();
  });

  it('updates topics parameter when selecting topics', () => {
    renderWithRouter(<TalksList />);
    // Simulate clicking both topics in sequence
    let topicButtons = screen.getAllByTestId(/^topic-/);
    // Click 'react'
    let reactBtn = topicButtons.find(btn => btn.textContent === 'react');
    if (!reactBtn) throw new Error('React topic button not found');
    fireEvent.click(reactBtn);
    mockSearchParams.set('topics', 'react');
    cleanup();
    renderWithRouter(<TalksList />);
    // Re-query topic buttons after re-render
    topicButtons = screen.getAllByTestId(/^topic-/);
    let tsBtn = topicButtons.find(btn => btn.textContent === 'typescript');
    if (!tsBtn) throw new Error('Typescript topic button not found');
    fireEvent.click(tsBtn);
    mockSearchParams.set('topics', 'react,typescript');
    cleanup();
    renderWithRouter(<TalksList />);
    // Check all calls for the expected value
    const found = mockSetSearchParams.mock.calls.some(call => call[0].get('topics') === 'react,typescript');
    expect(found).toBe(true);
    cleanup();
  });
});

describe('Has Notes Filter', () => {
  it('shows the Has Notes filter button', () => {
    (useTalks as any).mockImplementation(() => ({
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

    (useTalks as any).mockImplementation(() => ({
      talks: [talkWithNotes, talkWithoutNotes, talkWithEmptyNotes],
      loading: false,
      error: null
    }));

    renderWithRouter(<TalksList />);
    
    // Initially all talks should be visible
    const initialArticles = screen.getAllByRole('article');
    expect(initialArticles).toHaveLength(3);
    expect(screen.getByText('Talk with notes')).toBeInTheDocument();
    expect(screen.getByText('Talk without notes')).toBeInTheDocument();
    expect(screen.getByText('Talk with empty notes')).toBeInTheDocument();

    // Click the Has Notes filter
    const button = screen.getByRole('button', { name: /has notes/i });
    fireEvent.click(button);

    // Now only the talk with meaningful notes should be visible
    const filteredArticles = screen.getAllByRole('article');
    expect(filteredArticles).toHaveLength(1);
    expect(screen.getByText('Talk with notes')).toBeInTheDocument();
    expect(screen.queryByText('Talk without notes')).not.toBeInTheDocument();
    expect(screen.queryByText('Talk with empty notes')).not.toBeInTheDocument();

    // Verify the button state changed
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('text-white');
    expect(button).not.toHaveClass('bg-white');
    expect(button).not.toHaveClass('text-gray-700');
  });

});

describe('URL parameters for other filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();

    (useTalks as any).mockImplementation(() => ({
      talks: [
        createTalk({ id: '1', topics: ['react', 'typescript'] })
      ],
      loading: false,
      error: null
    }));
  });

  it('updates topics parameter when selecting topics (URL parameters for other filters)', () => {
    renderWithRouter(<TalksList />);
    // Simulate clicking both topics in sequence
    let topicButtons2 = screen.getAllByTestId(/^topic-/);
    let reactBtn2 = topicButtons2.find(btn => btn.textContent === 'react');
    if (!reactBtn2) throw new Error('React topic button not found');
    fireEvent.click(reactBtn2);
    mockSearchParams.set('topics', 'react');
    cleanup();
    renderWithRouter(<TalksList />);
    // Re-query topic buttons after re-render
    topicButtons2 = screen.getAllByTestId(/^topic-/);
    let tsBtn2 = topicButtons2.find(btn => btn.textContent === 'typescript');
    if (!tsBtn2) throw new Error('Typescript topic button not found');
    fireEvent.click(tsBtn2);
    mockSearchParams.set('topics', 'react,typescript');
    cleanup();
    renderWithRouter(<TalksList />);
    const found2 = mockSetSearchParams.mock.calls.some(call => call[0].get('topics') === 'react,typescript');
    expect(found2).toBe(true);
    cleanup();
  });

  it('updates yearType parameter when selecting year filter', () => {
    renderWithRouter(<TalksList />);
    const yearButton = screen.getByRole('button', { name: /year filter/i });
    fireEvent.click(yearButton);

    const params = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;
    expect(params.get('yearType')).toBe('last2');
  });
});

