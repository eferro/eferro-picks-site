import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TalksList } from './index';

// Create mock state
const mockState = {
  searchParams: new URLSearchParams(),
  setSearchParams: vi.fn(),
};

// Mock child components
vi.mock('./TalkSection', () => ({
  TalkSection: ({ coreTopic, talks, onTopicClick }: any) => (
    <section>
      <h2>{coreTopic} ({talks.length})</h2>
      <div>Talk Section Content</div>
      {talks.map((talk: any) => (
        <button
          key={talk.topics[0]}
          onClick={() => onTopicClick(talk.topics[0])}
          aria-label={`Filter by topic ${talk.topics[0]}`}
        >
          {talk.topics[0]}
        </button>
      ))}
    </section>
  ),
}));

vi.mock('./YearFilter', () => ({
  YearFilter: () => <div>Year Filter</div>,
}));

// Mock useTalks hook
vi.mock('../../hooks/useTalks', () => ({
  useTalks: () => ({
    talks: [
      {
        id: '1',
        title: 'Test Talk',
        speakers: ['John Doe'],
        topics: ['react'],
        core_topic: 'Frontend',
        conference_name: 'Conference 1',
        duration: '30:00',
        year: 2023,
        month: 1,
        day: 1,
        url: 'https://example.com',
        thumbnail_url: 'https://example.com/thumb.jpg',
      },
    ],
    loading: false,
    error: null,
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockState.searchParams, mockState.setSearchParams],
  useNavigate: () => vi.fn(),
}));

describe('TalksList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.searchParams = new URLSearchParams();
    mockState.setSearchParams = vi.fn();
  });

  it('renders without crashing', () => {
    render(<TalksList />);
    expect(screen.getByText('Frontend (1)')).toBeInTheDocument();
    expect(screen.getByText('Talk Section Content')).toBeInTheDocument();
    expect(screen.getByText('Year Filter')).toBeInTheDocument();
  });

  it('initializes topic filters from URL parameters', () => {
    mockState.searchParams = new URLSearchParams('?topics=react');
    render(<TalksList />);

    // Check that the topic filter is shown in the active filters section
    const topicFilter = screen.getByRole('button', { name: /^react ×$/i });
    expect(topicFilter).toBeInTheDocument();
    expect(topicFilter).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('updates URL when topic filter changes', () => {
    render(<TalksList />);

    // First call to setSearchParams happens on mount with empty params
    expect(mockState.setSearchParams).toHaveBeenCalledTimes(1);
    expect(mockState.setSearchParams).toHaveBeenNthCalledWith(1, new URLSearchParams());

    // Click the topic button
    const topicButton = screen.getByRole('button', { name: /Filter by topic react/i });
    fireEvent.click(topicButton);

    // Second call happens after clicking the button
    expect(mockState.setSearchParams).toHaveBeenCalledTimes(2);
    const params = new URLSearchParams();
    params.set('topics', 'react');
    expect(mockState.setSearchParams).toHaveBeenNthCalledWith(2, params);
  });
}); 