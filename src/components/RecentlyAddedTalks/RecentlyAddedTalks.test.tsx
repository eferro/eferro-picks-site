import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecentlyAddedTalks } from './index';
import { renderWithRouter, createTalk } from '../../test/utils';

describe('RecentlyAddedTalks', () => {
  describe('basic rendering', () => {
    it('should render the section title', () => {
      const talks = [createTalk({ id: '1', title: 'Test Talk' })];

      renderWithRouter(<RecentlyAddedTalks talks={talks} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Recently Added');
    });

    it('should render with proper semantic structure', () => {
      const talks = [createTalk({ id: '1', title: 'Test Talk' })];

      renderWithRouter(<RecentlyAddedTalks talks={talks} />);

      const section = screen.getByLabelText('Recently added talks');
      expect(section.tagName).toBe('SECTION');
    });

    it('should render empty state when no talks provided', () => {
      renderWithRouter(<RecentlyAddedTalks talks={[]} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Recently Added');
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });
  });

  describe('talk sorting and limiting', () => {
    it('should show only the 6 most recently added talks', () => {
      // Create 8 talks with different registered_at dates
      const talks = [
        createTalk({
          id: '1',
          title: 'Oldest Talk',
          registered_at: '2020-01-01T00:00:00Z'
        }),
        createTalk({
          id: '2',
          title: 'Recent Talk 6',
          registered_at: '2023-06-01T00:00:00Z'
        }),
        createTalk({
          id: '3',
          title: 'Recent Talk 5',
          registered_at: '2023-07-01T00:00:00Z'
        }),
        createTalk({
          id: '4',
          title: 'Recent Talk 4',
          registered_at: '2023-08-01T00:00:00Z'
        }),
        createTalk({
          id: '5',
          title: 'Recent Talk 3',
          registered_at: '2023-09-01T00:00:00Z'
        }),
        createTalk({
          id: '6',
          title: 'Recent Talk 2',
          registered_at: '2023-10-01T00:00:00Z'
        }),
        createTalk({
          id: '7',
          title: 'Most Recent Talk',
          registered_at: '2023-11-01T00:00:00Z'
        }),
        createTalk({
          id: '8',
          title: 'Another Old Talk',
          registered_at: '2021-01-01T00:00:00Z'
        }),
      ];

      renderWithRouter(<RecentlyAddedTalks talks={talks} />);

      // Should show exactly 6 talks
      const talkCards = screen.getAllByRole('article');
      expect(talkCards).toHaveLength(6);

      // Should NOT show the oldest talk
      expect(screen.queryByText('Oldest Talk')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Old Talk')).not.toBeInTheDocument();

      // Should show the most recent talk first
      expect(screen.getByText('Most Recent Talk')).toBeInTheDocument();
      expect(screen.getByText('Recent Talk 6')).toBeInTheDocument();
    });

    it('should handle talks without registered_at gracefully', () => {
      const talks = [
        createTalk({
          id: '1',
          title: 'Talk with date',
          registered_at: '2023-01-01T00:00:00Z'
        }),
        createTalk({
          id: '2',
          title: 'Talk without date'
          // no registered_at field
        }),
      ];

      renderWithRouter(<RecentlyAddedTalks talks={talks} />);

      // Should render without crashing
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Recently Added');

      // Should show the talk with date
      expect(screen.getByText('Talk with date')).toBeInTheDocument();
    });

    it('should show fewer than 6 talks if not enough available', () => {
      const talks = [
        createTalk({
          id: '1',
          title: 'Talk 1',
          registered_at: '2023-01-01T00:00:00Z'
        }),
        createTalk({
          id: '2',
          title: 'Talk 2',
          registered_at: '2023-02-01T00:00:00Z'
        }),
      ];

      renderWithRouter(<RecentlyAddedTalks talks={talks} />);

      const talkCards = screen.getAllByRole('article');
      expect(talkCards).toHaveLength(2);
    });
  });

  describe('component integration', () => {
    it('should pass correct props to TalkCard components', () => {
      const talks = [
        createTalk({
          id: '1',
          title: 'Test Talk',
          registered_at: '2023-01-01T00:00:00Z',
          speakers: ['John Doe'],
          topics: ['Testing']
        })
      ];

      renderWithRouter(<RecentlyAddedTalks talks={talks} />);

      // Verify TalkCard content is rendered (indicates proper props passing)
      expect(screen.getByText('Test Talk')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });
  });

  describe('maxTalks prop', () => {
    it('should respect custom maxTalks limit', () => {
      const talks = [
        createTalk({ id: '1', registered_at: '2023-01-01T00:00:00Z' }),
        createTalk({ id: '2', registered_at: '2023-02-01T00:00:00Z' }),
        createTalk({ id: '3', registered_at: '2023-03-01T00:00:00Z' }),
        createTalk({ id: '4', registered_at: '2023-04-01T00:00:00Z' }),
      ];

      renderWithRouter(<RecentlyAddedTalks talks={talks} maxTalks={2} />);

      const talkCards = screen.getAllByRole('article');
      expect(talkCards).toHaveLength(2);
    });
  });
});
