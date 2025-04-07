import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TalkCard } from './TalkCard';
import { mockTalk, mockHandlers, renderTalkCard, createTalk } from '../../test/utils';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('TalkCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
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
      expect(screen.getByRole('button', { name: /Filter by speaker: Test Speaker/i })).toBeInTheDocument();
    });

    it('renders the duration in hours and minutes', () => {
      const talk = createTalk({ duration: 3600 }); // 1 hour
      renderTalkCard({ talk });
      expect(screen.getByText('1h 0m')).toBeInTheDocument();
    });

    it('renders the topic', () => {
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
      expect(description).toHaveClass('line-clamp-5');
    });

    describe('Notes Icon', () => {
      it('does not render notes icon when notes are not present', () => {
        const talk = createTalk({ notes: undefined });
        renderTalkCard({ talk });
        expect(screen.queryByRole('img', { name: /notes/i })).not.toBeInTheDocument();
      });

      it('renders notes icon when notes are present', () => {
        const talk = createTalk({ notes: 'Some notes' });
        renderTalkCard({ talk });
        expect(screen.getByRole('img', { name: /notes/i })).toBeInTheDocument();
      });
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
      it('applies line clamp to description', () => {
        const talk = createTalk({
          description: 'Test description'
        });
        renderTalkCard({ talk });

        const description = screen.getByText('Test description');
        expect(description).toHaveClass('line-clamp-5');
      });
    });
  });

  describe('Interactions', () => {
    it('calls onTopicClick when topic is clicked and stops event propagation', () => {
      const onTopicClick = vi.fn();
      const talk = createTalk({ 
        topics: ['test'],
        core_topic: 'test'
      });
      const { onTopicClick: handler } = renderTalkCard({ talk, onTopicClick });
      
      const topicButton = screen.getByRole('button', { name: /Filter by topic test/i });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'stopPropagation', { value: vi.fn() });
      
      fireEvent(topicButton, clickEvent);
      
      expect(handler).toHaveBeenCalledWith('test');
      expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });

    it('calls onAuthorClick when author is clicked and stops event propagation', () => {
      const onAuthorClick = vi.fn();
      const talk = createTalk({ 
        speakers: ['Test Speaker']
      });
      const { onAuthorClick: handler } = renderTalkCard({ talk, onAuthorClick });
      
      const authorButton = screen.getByRole('button', { name: /Filter by speaker: Test Speaker/i });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'stopPropagation', { value: vi.fn() });
      
      fireEvent(authorButton, clickEvent);
      
      expect(handler).toHaveBeenCalledWith('Test Speaker');
      expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });

    it('calls onConferenceClick when conference is clicked and stops event propagation', () => {
      const onConferenceClick = vi.fn();
      const talk = createTalk({ 
        conference_name: 'Test Conference'
      });
      const { onConferenceClick: handler } = renderTalkCard({ talk, onConferenceClick });
      
      const conferenceButton = screen.getByRole('button', { name: /Filter by conference Test Conference/i });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'stopPropagation', { value: vi.fn() });
      
      fireEvent(conferenceButton, clickEvent);
      
      expect(handler).toHaveBeenCalledWith('Test Conference');
      expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });

    it('navigates to talk page when card is clicked', () => {
      const talk = createTalk({ id: 'test-id' });
      renderTalkCard({ talk });
      
      const card = screen.getByRole('article', { name: /Talk: Test Talk/i });
      fireEvent.click(card);
      
      expect(mockNavigate).toHaveBeenCalledWith('/talk/test-id');
    });

    it('navigates to talk page when Enter key is pressed', () => {
      const talk = createTalk({ id: 'test-id' });
      renderTalkCard({ talk });
      
      const card = screen.getByRole('article', { name: /Talk: Test Talk/i });
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(mockNavigate).toHaveBeenCalledWith('/talk/test-id');
    });

    it('stops event propagation when watch talk link is clicked', () => {
      const talk = createTalk({ 
        title: 'Test Talk',
        url: 'https://example.com/test' 
      });
      renderTalkCard({ talk });
      
      const link = screen.getByRole('link', { name: /Watch Test Talk/i });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'stopPropagation', { value: vi.fn() });
      
      fireEvent(link, clickEvent);
      
      expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies selected styling to topic when it is selected', () => {
      const talk = createTalk({ 
        topics: ['test'],
        core_topic: 'test'
      });
      renderTalkCard({ talk, selectedTopics: ['test'] });
      
      const topicButton = screen.getByRole('button', { name: /Filter by topic test/i });
      expect(topicButton).toHaveClass('bg-gray-700', 'text-white');
    });

    it('applies selected styling to speaker when they are selected', () => {
      const talk = createTalk({ 
        speakers: ['Test Speaker']
      });
      renderTalkCard({ talk, selectedAuthor: 'Test Speaker' });
      
      const authorButton = screen.getByRole('button', { name: /Filter by speaker: Test Speaker/i });
      expect(authorButton).toHaveClass('bg-blue-500', 'text-white');
    });

    it('applies selected styling to conference when it is selected', () => {
      const talk = createTalk({ 
        conference_name: 'Test Conference'
      });
      renderTalkCard({ talk, selectedConference: 'Test Conference' });
      
      const conferenceButton = screen.getByRole('button', { name: /Filter by conference Test Conference/i });
      expect(conferenceButton).toHaveClass('bg-blue-500', 'text-white');
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      const talk = createTalk({
        title: 'Test Talk',
        speakers: ['Test Speaker'],
        conference_name: 'Test Conference',
        topics: ['test'],
        core_topic: 'test',
        description: 'Test Description',
        year: 2023,
        duration: 1800,
        notes: 'Test notes'
      });

      renderTalkCard({ talk });

      // Main card accessibility
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Talk: Test Talk');

      // Topic button accessibility
      const topicButton = screen.getByRole('button', { name: /filter by topic test/i });
      expect(topicButton).toHaveAttribute('aria-label', 'Filter by topic test');

      // Author button accessibility
      const authorButton = screen.getByRole('button', { name: /filter by speaker: test speaker/i });
      expect(authorButton).toHaveAttribute('aria-label', 'Filter by speaker: Test Speaker');

      // Conference button accessibility
      const conferenceButton = screen.getByRole('button', { name: /filter by conference test conference/i });
      expect(conferenceButton).toHaveAttribute('aria-label', 'Filter by conference Test Conference');

      // Watch link accessibility
      const watchLink = screen.getByRole('link', { name: /watch test talk/i });
      expect(watchLink).toHaveAttribute('aria-label', 'Watch Test Talk');
    });
  });

  describe('Selected Styling', () => {
    it('applies selected styling to topic when it is selected', () => {
      const talk = createTalk({ 
        topics: ['test'],
        core_topic: 'test'
      });
      renderTalkCard({ talk, selectedTopics: ['test'] });
      
      const topicButton = screen.getByRole('button', { name: /Filter by topic test/i });
      expect(topicButton).toHaveClass('bg-gray-700', 'text-white');
    });
  });
}); 