import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TalksList } from '.';
import { useTalks } from '../../hooks/useTalks';
import { useSearchParams } from 'react-router-dom';
import { renderWithRouter, mockSearchParams, mockSetSearchParams, mockNavigate } from '../../test/utils';

// Mock the child components
vi.mock('./TalkSection', () => ({
  TalkSection: (props: any) => {
    const selectedTopics = props.selectedTopics || [];
    return (
      <section>
        <h2>{props.coreTopic} ({props.talks.length})</h2>
        {props.talks.map((talk: any) => (
          <div key={talk.id}>
            <div 
              role="article" 
              onClick={() => mockNavigate({
                pathname: `/talk/${talk.id}`,
                search: mockSearchParams.toString()
              })}
            >
              {talk.title}
            </div>
            {talk.topics.map((topic: string) => (
              <button
                key={topic}
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

describe('TalksList', () => {
  beforeEach(() => {
    (useTalks as any).mockImplementation(() => ({
      talks: [
        {
          id: '1',
          title: 'Test Talk',
          description: 'Test Description',
          speakers: ['Test Speaker'],
          duration: 1800,
          url: 'https://test.com',
          topics: ['react'],
          core_topic: 'Engineering Culture',
          year: 2023
        }
      ],
      loading: false,
      error: null
    }));

    // Reset mocks and internal state
    vi.clearAllMocks();
    mockSearchParams._params.clear();
  });

  const renderComponent = () => renderWithRouter(<TalksList />);

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Engineering Culture (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Talk')).toBeInTheDocument();
  });

  it('initializes with yearType from URL', () => {
    // Set initial state
    mockSearchParams._params.set('yearType', 'last2');
    
    renderComponent();
    expect(screen.getByText('Year Filter')).toBeInTheDocument();
  });

  it('preserves yearType when navigating', () => {
    // Set initial state
    mockSearchParams._params.set('yearType', 'last2');
    
    renderComponent();

    // Verify that the year filter is preserved in navigation
    const talkLink = screen.getByText('Test Talk');
    fireEvent.click(talkLink);

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/talk/1',
      search: 'yearType=last2'
    });
  });
}); 