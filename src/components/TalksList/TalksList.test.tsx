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

    // Reset mocks and internal state
    vi.clearAllMocks();
    mockSearchParams._params.clear();
  });

  const renderComponent = () => renderWithRouter(<TalksList />);

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Engineering Culture (5)')).toBeInTheDocument();
    expect(screen.getByText('Talk with both topics')).toBeInTheDocument();
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