import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TalkCard } from './TalkCard';
import { mockTalk, mockHandlers } from '../../test/utils';
import { BrowserRouter } from 'react-router-dom';

describe('TalkCard', () => {
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
}); 