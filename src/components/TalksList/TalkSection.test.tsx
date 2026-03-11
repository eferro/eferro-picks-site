import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TalkSection } from './TalkSection';
import { createTalk, renderWithRouter } from '../../test/utils';

// Mock TalkCard to simplify testing and expose handler props
interface MockTalkCardProps {
  talk: {
    id: string;
    conference_name: string;
    topics: string[];
  };
  onConferenceClick: (conference: string) => void;
  onTopicClick: (topic: string) => void;
}

vi.mock('./TalkCard', () => ({
  TalkCard: ({ talk, onConferenceClick, onTopicClick }: MockTalkCardProps) => (
    <div data-testid={`talk-${talk.id}`}>
      <button onClick={() => onConferenceClick(talk.conference_name)}>conf</button>
      {talk.topics.map((topic) => (
        <button key={topic} onClick={() => onTopicClick(topic)}>{`topic-${topic}`}</button>
      ))}
    </div>
  )
}));

const makeHandlers = () => ({
  onConferenceClick: vi.fn(),
  onTopicClick: vi.fn(),
});

describe('TalkSection', () => {
  it('renders heading with count and talk cards', () => {
    const talks = [createTalk({ id: '1' }), createTalk({ id: '2' })];
    const handlers = makeHandlers();
    renderWithRouter(
      <TalkSection
        coreTopic="Testing"
        talks={talks}
        selectedConference={null}
        selectedQuery=""
        {...handlers}
      />
    );
    const heading = screen.getByRole('heading', { name: /Testing \(2\)/ });
    expect(heading).toBeInTheDocument();
    const cards = screen.getAllByTestId(/talk-/);
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('forwards onConferenceClick to TalkCard', () => {
    const talk = createTalk({ id: '1', conference_name: 'Conf' });
    const handlers = makeHandlers();
    renderWithRouter(
      <TalkSection
        coreTopic="Core"
        talks={[talk]}
        selectedConference={null}
        selectedQuery=""
        {...handlers}
      />
    );
    const heading = screen.getByRole('heading', { name: /Core \(1\)/ });
    expect(heading).toBeInTheDocument();
    fireEvent.click(screen.getByText('conf'));
    expect(handlers.onConferenceClick).toHaveBeenCalledWith('Conf');
  });

  it('forwards onTopicClick to TalkCard', () => {
    const talk = createTalk({ id: '1', topics: ['agile'] });
    const handlers = makeHandlers();
    renderWithRouter(
      <TalkSection
        coreTopic="Core"
        talks={[talk]}
        selectedConference={null}
        selectedQuery=""
        {...handlers}
      />
    );
    fireEvent.click(screen.getByText('topic-agile'));
    expect(handlers.onTopicClick).toHaveBeenCalledWith('agile');
  });
});
