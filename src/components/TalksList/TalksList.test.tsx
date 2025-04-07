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
          core_topic: 'Engineering Culture'
        }
      ],
      loading: false,
      error: null
    }));

    // Set up URL params before each test
    mockSearchParams.get.mockImplementation(param => param === 'topics' ? 'react' : null);
    mockSearchParams.toString.mockImplementation(() => 'topics=react');
  });

  const renderComponent = () => renderWithRouter(<TalksList />);

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Engineering Culture (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Talk')).toBeInTheDocument();
  });
}); 