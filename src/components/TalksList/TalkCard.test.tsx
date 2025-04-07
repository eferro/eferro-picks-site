import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TalkCard } from './TalkCard';
import { mockTalk, mockHandlers } from '../../test/utils';
import { BrowserRouter } from 'react-router-dom';

const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => navigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('TalkCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the talk title', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Talk')).toBeInTheDocument();
  });

  it('renders the speaker name', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Speaker')).toBeInTheDocument();
  });

  it('renders the duration in hours and minutes', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('1h 0m')).toBeInTheDocument();
  });

  it('renders the topic', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders the conference name', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Conference')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render notes icon when notes are not present', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.queryByRole('img', { name: /notes/i })).not.toBeInTheDocument();
  });

  it('renders notes icon when notes are present', () => {
    const talkWithNotes = { ...mockTalk, notes: 'Some notes' };
    render(
      <BrowserRouter>
        <TalkCard
          talk={talkWithNotes}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('img', { name: /notes/i })).toBeInTheDocument();
  });

  it('calls onTopicClick when topic is clicked', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    const topicButton = screen.getByRole('button', { name: 'test' });
    fireEvent.click(topicButton);

    expect(mockHandlers.onTopicClick).toHaveBeenCalledWith('test');
  });

  it('calls onAuthorClick when speaker is clicked', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    const speakerButton = screen.getByRole('button', { name: 'Filter by speaker: Test Speaker' });
    fireEvent.click(speakerButton);

    expect(mockHandlers.onAuthorClick).toHaveBeenCalledWith('Test Speaker');
  });

  it('calls onConferenceClick when conference is clicked', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    const conferenceButton = screen.getByRole('button', { name: 'Test Conference' });
    fireEvent.click(conferenceButton);

    expect(mockHandlers.onConferenceClick).toHaveBeenCalledWith('Test Conference');
  });

  it('navigates to talk details when card is clicked', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    const card = screen.getByRole('article', { name: 'Talk: Test Talk' });
    fireEvent.click(card);

    expect(navigate).toHaveBeenCalledWith('/talk/1');
  });

  it('has correct watch talk link', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    const watchLink = screen.getByRole('link', { name: /watch test talk/i });
    expect(watchLink).toHaveAttribute('href', 'https://example.com');
    expect(watchLink).toHaveAttribute('target', '_blank');
    expect(watchLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies selected styling to selected topic', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={['test']}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    const topicButton = screen.getByRole('button', { name: 'test' });
    expect(topicButton).toHaveClass('bg-gray-700', 'text-white');
  });

  it('applies selected styling to selected speaker', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor="Test Speaker"
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference={null}
        />
      </BrowserRouter>
    );

    const speakerButton = screen.getByRole('button', { name: 'Filter by speaker: Test Speaker' });
    expect(speakerButton).toHaveClass('bg-blue-500', 'text-white');
  });

  it('applies selected styling to selected conference', () => {
    render(
      <BrowserRouter>
        <TalkCard
          talk={mockTalk}
          onAuthorClick={mockHandlers.onAuthorClick}
          selectedAuthor={null}
          onTopicClick={mockHandlers.onTopicClick}
          selectedTopics={[]}
          onConferenceClick={mockHandlers.onConferenceClick}
          selectedConference="Test Conference"
        />
      </BrowserRouter>
    );

    const conferenceButton = screen.getByRole('button', { name: 'Test Conference' });
    expect(conferenceButton).toHaveClass('bg-blue-500', 'text-white');
  });
}); 