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
              onClick={() => mockNavigate({
                pathname: `/talk/${talk.id}`,
                search: mockSearchParams.toString()
              })}
            >
              {talk.title}
            </div>
            {talk.topics.map((topic: string) => (
              <button
                key={`${talk.id}-${topic}`}
                onClick={() => props.onTopicClick(topic)}
                aria-label={`Filter by topic ${topic}`}
                data-testid={`topic-${topic}`}
                data-selected={selectedTopics.includes(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        ))}
      </section>
    );
  }
}));

vi.mock('./YearFilter', () => ({
  YearFilter: () => <div>Year Filter</div>
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
  });

  it('toggles the rating filter and updates URL params', () => {
    // Initial state is filtering by 5 stars
    renderWithRouter(<TalksList />);
    const [toggle] = screen.getAllByRole('button', { name: /toggle rating filter/i });
    // Click to remove rating filter (to show all)
    fireEvent.click(toggle);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
    let params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('rating')).toBe('all');

    // Simulate URL with rating=all and re-render
    mockSearchParams.set('rating', 'all');
    renderWithRouter(<TalksList />);
    const [updated] = screen.getAllByRole('button', { name: /toggle rating filter/i });
    expect(updated).toHaveTextContent('All');
    // Click to enable 5-star filter again
    fireEvent.click(updated);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
    params = mockSetSearchParams.mock.calls[1][0] as URLSearchParams;
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
        {
          id: '1',
          title: 'Talk with both topics',
          description: 'Test Description',
          speakers: ['Test Speaker'],
          duration: 1800,
          url: 'https://test.com',
          topics: ['react', 'typescript'],
          core_topic: 'Engineering Culture',
          year: 2023
        },
        {
          id: '2',
          title: 'Talk with only first topic',
          description: 'Test Description',
          speakers: ['Test Speaker'],
          duration: 1800,
          url: 'https://test.com',
          topics: ['react'],
          core_topic: 'Engineering Culture',
          year: 2023
        },
        {
          id: '3',
          title: 'Talk with only second topic',
          description: 'Test Description',
          speakers: ['Test Speaker'],
          duration: 1800,
          url: 'https://test.com',
          topics: ['typescript'],
          core_topic: 'Engineering Culture',
          year: 2023
        },
        {
          id: '4',
          title: 'Talk with both topics plus extra',
          description: 'Test Description',
          speakers: ['Test Speaker'],
          duration: 1800,
          url: 'https://test.com',
          topics: ['react', 'typescript', 'testing'],
          core_topic: 'Engineering Culture',
          year: 2023
        },
        {
          id: '5',
          title: 'Talk with no matching topics',
          description: 'Test Description',
          speakers: ['Test Speaker'],
          duration: 1800,
          url: 'https://test.com',
          topics: ['testing'],
          core_topic: 'Engineering Culture',
          year: 2023
        }
      ],
      loading: false,
      error: null
    }));
  });

  const renderComponent = () => renderWithRouter(<TalksList />);

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Engineering Culture (5)')).toBeInTheDocument();
    expect(screen.getByText('Talk with both topics')).toBeInTheDocument();
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
    const talkLink = screen.getByText('Talk with both topics');
    fireEvent.click(talkLink);

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/talk/1',
      search: 'yearType=last2'
    });
  });

  it('filters talks using AND condition when multiple topics are selected', () => {
    renderComponent();

    // Click on the first topic (react)
    const reactButtons = screen.getAllByRole('button', { name: /Filter by topic react/i });
    fireEvent.click(reactButtons[0]); // Click the first one

    // Click on the second topic (typescript)
    const typescriptButtons = screen.getAllByRole('button', { name: /Filter by topic typescript/i });
    fireEvent.click(typescriptButtons[0]); // Click the first one

    // Should show talks with both topics
    expect(screen.getByText('Talk with both topics')).toBeInTheDocument();
    expect(screen.getByText('Talk with both topics plus extra')).toBeInTheDocument();
    
    // Should not show talks with only one topic
    expect(screen.queryByText('Talk with only first topic')).not.toBeInTheDocument();
    expect(screen.queryByText('Talk with only second topic')).not.toBeInTheDocument();
    
    // Should not show talks with no matching topics
    expect(screen.queryByText('Talk with no matching topics')).not.toBeInTheDocument();
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

