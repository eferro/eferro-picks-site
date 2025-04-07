import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
}); 