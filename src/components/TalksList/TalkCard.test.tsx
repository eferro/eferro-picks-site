import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ComponentProps } from 'react';
import { TalkCard } from './TalkCard';
import { createTalk, mockTalk } from '../../test/builders';
import { renderWithRouter, currentLocation } from '../../test/router';

const renderTalkCard = (
  props: Partial<ComponentProps<typeof TalkCard>> = {},
  params = ''
) =>
  renderWithRouter(
    <TalkCard
      talk={mockTalk}
      onConferenceClick={vi.fn()}
      onTopicClick={vi.fn()}
      selectedConference={null}
      selectedQuery=""
      {...props}
    />,
    { params }
  );

describe('TalkCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the talk title', () => {
      const talk = createTalk({ title: 'Test Title' });
      renderTalkCard({ talk });
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders the speaker name', () => {
      const talk = createTalk({
        speakers: ['Test Speaker']
      });
      renderTalkCard({ talk });
      expect(screen.getByLabelText(/Speaker: Test Speaker/i)).toBeInTheDocument();
    });

    it('renders the duration in hours and minutes', () => {
      const talk = createTalk({ duration: 3600 }); // 1 hour
      renderTalkCard({ talk });
      expect(screen.getByText('1h 0m')).toBeInTheDocument();
    });

    it('renders the topic as a clickable button', () => {
      const talk = createTalk({
        topics: ['test'],
        core_topic: 'test'
      });
      renderTalkCard({ talk });
      expect(screen.getByRole('button', { name: /Filter by topic test/i })).toBeInTheDocument();
    });

    it('renders the conference name', () => {
      const talk = createTalk({ 
        conference_name: 'Test Conference'
      });
      renderTalkCard({ talk });
      expect(screen.getByRole('button', { name: /Filter by conference Test Conference/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      const talk = createTalk({ description: 'Custom test description' });
      renderTalkCard({ talk });
      const description = screen.getByText('Custom test description');
      expect(description).toBeInTheDocument();
    });

    describe('Notes Icon', () => {
      it('does not render notes icon when notes are not present', () => {
        const talk = createTalk({ notes: undefined });
        renderTalkCard({ talk });
        expect(screen.queryByRole('img', { name: /This talk has detailed notes/i })).not.toBeInTheDocument();
      });

      it('does not render notes icon when notes are just whitespace', () => {
        const talk = createTalk({ notes: '   \n  \r\n  ' });
        renderTalkCard({ talk });
        expect(screen.queryByRole('img', { name: /This talk has detailed notes/i })).not.toBeInTheDocument();
      });

      it('renders notes icon when notes have meaningful content', () => {
        const talk = createTalk({ notes: 'Some actual notes' });
        renderTalkCard({ talk });
        expect(screen.getByRole('img', { name: /This talk has detailed notes/i })).toBeInTheDocument();
      });
    });

    it('shows format icon based on talk format', () => {
      const talk = createTalk({ format: 'podcast' });
      renderTalkCard({ talk });
      expect(screen.getByLabelText(/format: podcast/i)).toBeInTheDocument();
    });

    it('has correct watch talk link', () => {
      const talk = createTalk({
        title: 'Test Talk',
        url: 'https://example.com'
      });
      renderTalkCard({ talk });

      const watchLink = screen.getByRole('link', { name: /watch test talk/i });
      expect(watchLink).toHaveAttribute('href', 'https://example.com');
      expect(watchLink).toHaveAttribute('target', '_blank');
      expect(watchLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    describe('Year Display', () => {
      it('renders the year when available', () => {
        const talk = createTalk({ year: 2023 });
        renderTalkCard({ talk });
        expect(screen.getByText('2023')).toBeInTheDocument();
      });

      it('does not render the year when not available', () => {
        const talk = createTalk({ year: undefined });
        renderTalkCard({ talk });
        expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument();
      });
    });

    describe('Description', () => {
      it('renders the description text', () => {
        const talk = createTalk({
          description: 'Test description'
        });
        renderTalkCard({ talk });

        const description = screen.getByText('Test description');
        expect(description).toBeInTheDocument();
      });
    });

    describe('Rating Display', () => {
      it('displays star icon for 5-star rated talks', () => {
        const talk = createTalk({ rating: 5 });
        renderTalkCard({ talk });

        const starIcon = screen.getByRole('img', { name: /Top rated/i });
        expect(starIcon).toBeInTheDocument();
        expect(starIcon).toHaveAttribute('title', 'Top rated');
      });

      it('does not display star icon for talks with rating less than 5', () => {
        const talk = createTalk({ rating: 4 });
        renderTalkCard({ talk });

        expect(screen.queryByRole('img', { name: /Top rated/i })).not.toBeInTheDocument();
      });

      it('does not display star icon for talks without rating', () => {
        const talk = createTalk({ rating: undefined });
        renderTalkCard({ talk });

        expect(screen.queryByRole('img', { name: /Top rated/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('filters by topic without opening the talk when a topic tag is clicked', () => {
      const onTopicClick = vi.fn();
      renderTalkCard({ talk: createTalk({ topics: ['testing', 'agile'] }), onTopicClick });

      fireEvent.click(screen.getByRole('button', { name: /Filter by topic testing/i }));

      expect(onTopicClick).toHaveBeenCalledWith('testing');
      expect(currentLocation().pathname).toBe('/');
    });

    it('filters by conference without opening the talk when the conference is clicked', () => {
      const onConferenceClick = vi.fn();
      renderTalkCard({ talk: createTalk({ conference_name: 'Test Conference' }), onConferenceClick });

      fireEvent.click(screen.getByRole('button', { name: /Filter by conference Test Conference/i }));

      expect(onConferenceClick).toHaveBeenCalledWith('Test Conference');
      expect(currentLocation().pathname).toBe('/');
    });

    it('navigates to talk page when card is clicked', () => {
      const talk = createTalk({ id: 'test-id' });
      renderTalkCard({ talk }, 'topics=test');
      
      const card = screen.getByRole('article', { name: /Talk: Test Talk/i });
      fireEvent.click(card);
      
      expect(currentLocation()).toMatchObject({ pathname: '/talk/test-id', search: '?topics=test' });
    });

    it('navigates to talk page when Enter key is pressed', () => {
      const talk = createTalk({ id: 'test-id' });
      renderTalkCard({ talk }, 'topics=test');
      
      const card = screen.getByRole('article', { name: /Talk: Test Talk/i });
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(currentLocation()).toMatchObject({ pathname: '/talk/test-id', search: '?topics=test' });
    });

    describe('Open in new tab', () => {
      let openSpy: MockInstance<typeof window.open>;

      beforeEach(() => {
        openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      });

      afterEach(() => {
        openSpy.mockRestore();
      });

      it('renders the title as a link to the talk detail preserving filters', () => {
        renderTalkCard({ talk: createTalk({ id: 'test-id', title: 'Linked Talk' }) }, 'topics=test');

        const titleLink = screen.getByRole('link', { name: 'Linked Talk' });
        expect(titleLink).toHaveAttribute('href', '/talk/test-id?topics=test');
      });

      it('navigates to the talk detail when the title link is clicked', () => {
        renderTalkCard({ talk: createTalk({ id: 'test-id', title: 'Linked Talk' }) }, 'topics=test');

        fireEvent.click(screen.getByRole('link', { name: 'Linked Talk' }));

        expect(currentLocation()).toMatchObject({ pathname: '/talk/test-id', search: '?topics=test' });
      });

      it.each([
        ['Ctrl', { ctrlKey: true }],
        ['Cmd', { metaKey: true }],
      ])('opens the talk in a new tab on %s+click on the card', (_label, modifiers) => {
        renderTalkCard({ talk: createTalk({ id: 'test-id' }) }, 'topics=test');

        fireEvent.click(screen.getByRole('article'), modifiers);

        expect(openSpy).toHaveBeenCalledWith('/talk/test-id?topics=test', '_blank', 'noopener');
        expect(currentLocation().pathname).toBe('/');
      });

      it('opens the talk in a new tab on middle click on the card', () => {
        renderTalkCard({ talk: createTalk({ id: 'test-id' }) }, 'topics=test');

        fireEvent(screen.getByRole('article'), new MouseEvent('auxclick', { bubbles: true, button: 1 }));

        expect(openSpy).toHaveBeenCalledWith('/talk/test-id?topics=test', '_blank', 'noopener');
      });

      it('ignores auxiliary clicks that are not the middle button', () => {
        renderTalkCard({ talk: createTalk({ id: 'test-id' }) }, 'topics=test');

        fireEvent(screen.getByRole('article'), new MouseEvent('auxclick', { bubbles: true, button: 2 }));

        expect(openSpy).not.toHaveBeenCalled();
      });

      it('does not open a new tab on a plain click on the card', () => {
        renderTalkCard({ talk: createTalk({ id: 'test-id' }) }, 'topics=test');

        fireEvent.click(screen.getByRole('article'));

        expect(openSpy).not.toHaveBeenCalled();
        expect(currentLocation().pathname).toBe('/talk/test-id');
      });
    });

    it('does not open the talk detail when the watch link is clicked', () => {
      renderTalkCard({ talk: createTalk({ title: 'Test Talk', url: 'https://example.com/test' }) });

      fireEvent.click(screen.getByRole('link', { name: /Watch Test Talk/i }));

      expect(currentLocation().pathname).toBe('/');
    });
  });

  describe('Styling', () => {
    it('applies selected styling to topic when it matches selectedQuery', () => {
      const talk = createTalk({ topics: ['testing'] });
      renderTalkCard({ talk, selectedQuery: 'testing' });

      const topicButton = screen.getByRole('button', { name: /Filter by topic testing/i });
      expect(topicButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('applies unselected styling to topic when it does not match selectedQuery', () => {
      const talk = createTalk({ topics: ['testing'] });
      renderTalkCard({ talk, selectedQuery: 'other' });

      const topicButton = screen.getByRole('button', { name: /Filter by topic testing/i });
      expect(topicButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('applies selected styling to conference when it is selected', () => {
      const talk = createTalk({
        conference_name: 'Test Conference'
      });
      renderTalkCard({ talk, selectedConference: 'Test Conference' });

      const conferenceButton = screen.getByRole('button', { name: /Filter by conference Test Conference/i });
      expect(conferenceButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Accessibility', () => {
    it('exposes every control with a descriptive accessible name', () => {
      const talk = createTalk({
        title: 'Test Talk',
        speakers: ['Test Speaker'],
        conference_name: 'Test Conference',
        topics: ['test'],
      });

      renderTalkCard({ talk });

      expect(screen.getByRole('article', { name: 'Talk: Test Talk' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Test Talk' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter by topic test' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter by conference Test Conference' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Watch Test Talk' })).toBeInTheDocument();
      expect(screen.getByLabelText('Speaker: Test Speaker')).toBeInTheDocument();
    });

    it('makes the card focusable with the keyboard', () => {
      renderTalkCard({ talk: createTalk() });

      expect(screen.getByRole('article')).toHaveAttribute('tabindex', '0');
    });

    it('gives the top rated star a tooltip', () => {
      renderTalkCard({ talk: createTalk({ rating: 5 }) });

      expect(screen.getByRole('img', { name: 'Top rated' })).toHaveAttribute('title', 'Top rated');
    });
  });

  // Selected Styling section removed - topics/speakers no longer clickeable
}); 