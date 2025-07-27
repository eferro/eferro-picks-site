import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TalkSection } from './TalkSection';
import { createTalk, renderWithRouter } from '../../test/utils';

// Mock TalkCard to simplify testing and expose handler props
vi.mock('./TalkCard', () => ({
  TalkCard: ({ talk, onAuthorClick, onTopicClick, onConferenceClick }: any) => (
    <div data-testid={`talk-${talk.id}`}>
      <button onClick={() => onAuthorClick(talk.speakers[0])}>author</button>
      <button onClick={() => onTopicClick(talk.topics[0])}>topic</button>
      <button onClick={() => onConferenceClick(talk.conference_name)}>conf</button>
    </div>
  )
}));

const makeHandlers = () => ({
  onAuthorClick: vi.fn(),
  onTopicClick: vi.fn(),
  onConferenceClick: vi.fn(),
});

describe('TalkSection', () => {
  it('renders heading with count and talk cards', () => {
    const talks = [createTalk({ id: '1' }), createTalk({ id: '2' })];
    const handlers = makeHandlers();
    renderWithRouter(
      <TalkSection
        coreTopic="Testing"
        talks={talks}
        selectedAuthor={null}
        selectedTopics={[]}
        selectedConference={null}
        openByDefault
        {...handlers}
      />
    );
    const button = screen.getByRole('button', { name: /Testing/ });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const cards = screen.getAllByTestId(/talk-/);
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('forwards handler props to TalkCard and toggles section', () => {
    const talk = createTalk({ id: '1', speakers: ['Author'], topics: ['Topic'], conference_name: 'Conf' });
    const handlers = makeHandlers();
    renderWithRouter(
      <TalkSection
        coreTopic="Core"
        talks={[talk]}
        selectedAuthor={null}
        selectedTopics={[]}
        selectedConference={null}
        openByDefault={false}
        {...handlers}
      />
    );
    const toggle = screen.getByRole('button', { name: /Core/ });
    const details = screen.getByTestId('talk-section');
    expect(details).not.toHaveAttribute('open');
    fireEvent.click(toggle);
    expect(details).toHaveAttribute('open');
    fireEvent.click(screen.getByText('author'));
    fireEvent.click(screen.getByText('topic'));
    fireEvent.click(screen.getByText('conf'));
    expect(handlers.onAuthorClick).toHaveBeenCalledWith('Author');
    expect(handlers.onTopicClick).toHaveBeenCalledWith('Topic');
    expect(handlers.onConferenceClick).toHaveBeenCalledWith('Conf');
  });
});
