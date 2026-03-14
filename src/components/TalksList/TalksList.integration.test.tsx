import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderIntegration } from '../../test/integration/IntegrationTestHelpers';
import { TalksList } from '.';
import { useTalks } from '../../hooks/useTalks';
import { createTalk } from '../../test/utils';

/**
 * TalksList Integration Tests
 *
 * APPROACH: Test real user workflows with minimal mocking
 * - Mock only useTalks (data boundary)
 * - Use real child components (TalkSection, YearFilter, etc.)
 * - Use real TalksFilter logic
 * - Verify user-visible behavior, not implementation details
 *
 * BENEFITS:
 * - Tests survive refactoring
 * - Catch real integration bugs
 * - Higher confidence in changes
 * - Less test maintenance
 */

// Mock only the data boundary
vi.mock('../../hooks/useTalks');

describe('TalksList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Filter Workflows', () => {
    it('displays all talks when no filters are active', () => {
      const talks = [
        createTalk({ id: '1', title: 'Talk One' }),
        createTalk({ id: '2', title: 'Talk Two' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />);

      // All talks visible without filters
      expect(screen.getByText('Talk One')).toBeInTheDocument();
      expect(screen.getByText('Talk Two')).toBeInTheDocument();
    });

    it('filters talks by format', () => {
      const talks = [
        createTalk({ id: '1', title: 'A Podcast', format: 'podcast' }),
        createTalk({ id: '2', title: 'A Talk', format: 'talk' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      // Start with format filter active
      renderIntegration(<TalksList />, {
        initialPath: '/talks',
        initialParams: new URLSearchParams('format=podcast')
      });

      // Real TalksFilter applies format filter
      expect(screen.getByText('A Podcast')).toBeInTheDocument();
      expect(screen.queryByText('A Talk')).not.toBeInTheDocument();
    });

    it('filters talks with meaningful notes', () => {
      const talks = [
        createTalk({ id: '1', title: 'Talk with notes', notes: 'Detailed notes here' }),
        createTalk({ id: '2', title: 'Talk without notes', notes: undefined }),
        createTalk({ id: '3', title: 'Talk with whitespace', notes: '   \n  ' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      // Start with hasNotes filter active
      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('hasNotes=true')
      });

      // Real TalksFilter with real hasMeaningfulNotes utility
      expect(screen.getByText('Talk with notes')).toBeInTheDocument();
      expect(screen.queryByText('Talk without notes')).not.toBeInTheDocument();
      expect(screen.queryByText('Talk with whitespace')).not.toBeInTheDocument();
    });

    it('applies multiple filters simultaneously', () => {
      const talks = [
        createTalk({ id: '1', title: 'Perfect match', format: 'podcast', notes: 'Notes' }),
        createTalk({ id: '2', title: 'No notes', format: 'podcast', notes: undefined }),
        createTalk({ id: '3', title: 'Wrong format', format: 'talk', notes: 'Notes' }),
        createTalk({ id: '4', title: 'Nothing matches', format: 'talk', notes: undefined })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      // Start with multiple filters active
      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('format=podcast&hasNotes=true')
      });

      // Real TalksFilter applies all filters simultaneously
      expect(screen.getByText('Perfect match')).toBeInTheDocument();
      expect(screen.queryByText('No notes')).not.toBeInTheDocument();
      expect(screen.queryByText('Wrong format')).not.toBeInTheDocument();
      expect(screen.queryByText('Nothing matches')).not.toBeInTheDocument();
    });

    it('displays active filter chips', () => {
      const talks = [
        createTalk({ id: '1', title: 'Podcast with notes', format: 'podcast', notes: 'Notes' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      // Start with multiple filters active
      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('format=podcast&hasNotes=true&quickWatch=true')
      });

      // Real ActiveFilters component displays all active filters as chips
      expect(screen.getByRole('button', { name: /remove quick watch filter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove has notes filter/i })).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters talks by query matching title', () => {
      const talks = [
        createTalk({ id: '1', title: 'React Testing', speakers: ['Alice'], topics: ['react'] }),
        createTalk({ id: '2', title: 'Vue Basics', speakers: ['Bob'], topics: ['vue'] })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      // Start with search query active
      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('query=React')
      });

      // Real TalksFilter applies query filter
      expect(screen.getByText('React Testing')).toBeInTheDocument();
      expect(screen.queryByText('Vue Basics')).not.toBeInTheDocument();
    });

    it('filters talks by query matching speaker name', () => {
      const talks = [
        createTalk({ id: '1', title: 'Talk 1', speakers: ['Alice Smith'] }),
        createTalk({ id: '2', title: 'Talk 2', speakers: ['Bob Jones'] })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('query=Alice')
      });

      expect(screen.getByText('Talk 1')).toBeInTheDocument();
      expect(screen.queryByText('Talk 2')).not.toBeInTheDocument();
    });

    it('filters talks by query matching topic', () => {
      const talks = [
        createTalk({ id: '1', title: 'Talk 1', topics: ['testing', 'tdd'] }),
        createTalk({ id: '2', title: 'Talk 2', topics: ['refactoring'] })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('query=tdd')
      });

      expect(screen.getByText('Talk 1')).toBeInTheDocument();
      expect(screen.queryByText('Talk 2')).not.toBeInTheDocument();
    });
  });

  describe('Year Filter Workflows', () => {
    it('filters by last 2 years', () => {
      const currentYear = new Date().getFullYear();
      const talks = [
        createTalk({ id: '1', title: 'Recent talk', year: currentYear }),
        createTalk({ id: '2', title: 'Old talk', year: currentYear - 3 })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('yearType=last2')
      });

      // Real TalksFilter applies year range
      expect(screen.getByText('Recent talk')).toBeInTheDocument();
      expect(screen.queryByText('Old talk')).not.toBeInTheDocument();
    });

    it('filters by specific year', () => {
      const talks = [
        createTalk({ id: '1', title: 'Talk from 2023', year: 2023 }),
        createTalk({ id: '2', title: 'Talk from 2024', year: 2024 })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('year=2023&yearType=specific')
      });

      expect(screen.getByText('Talk from 2023')).toBeInTheDocument();
      expect(screen.queryByText('Talk from 2024')).not.toBeInTheDocument();
    });

    it('displays year filter chip when active', () => {
      const talks = [createTalk({ id: '1', title: 'Talk from 2023', year: 2023 })];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('year=2023&yearType=specific')
      });

      // Real ActiveFilters component shows year chip
      // The chip is a button element containing "2023" and a close button "×"
      const chipButtons = screen.getAllByRole('button');
      const yearChip = chipButtons.find(btn =>
        btn.textContent?.includes('2023') && btn.textContent?.includes('×')
      );
      expect(yearChip).toBeDefined();
    });
  });

  describe('Conference Filter Workflows', () => {
    it('filters by conference', () => {
      const talks = [
        createTalk({ id: '1', title: 'NDC Talk', conference_name: 'NDC London' }),
        createTalk({ id: '2', title: 'Another Talk', conference_name: 'JSConf' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('conference=NDC London')
      });

      // Real TalksFilter applies conference filter
      expect(screen.getByText('NDC Talk')).toBeInTheDocument();
      expect(screen.queryByText('Another Talk')).not.toBeInTheDocument();
    });

    it('displays conference buttons on talk cards', () => {
      const talks = [
        createTalk({ id: '1', title: 'NDC Talk', conference_name: 'NDC London' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />);

      // Real TalkCard component renders conference button
      expect(screen.getByRole('button', { name: /filter by conference ndc london/i })).toBeInTheDocument();
    });
  });

  describe('Topic Filter Workflows', () => {
    it('displays topic buttons on talk cards', () => {
      const talks = [
        createTalk({ id: '1', title: 'React Talk', topics: ['react', 'hooks'] })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />);

      // Real TalkCard component renders topic buttons
      expect(screen.getByRole('button', { name: /filter by topic react/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /filter by topic hooks/i })).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading spinner while fetching talks', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [],
        loading: true,
        error: null
      });

      renderIntegration(<TalksList />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows error message on fetch failure', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [],
        loading: false,
        error: new Error('Failed to fetch')
      });

      renderIntegration(<TalksList />);

      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });

    it('shows empty state when no talks match filters', () => {
      const talks = [
        createTalk({ id: '1', title: 'A Talk', format: 'talk' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      // Filter for podcasts when we only have talks
      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('format=podcast')
      });

      expect(screen.getByText(/no talks found matching your criteria/i)).toBeInTheDocument();
    });
  });

  describe('Results Count', () => {
    it('displays correct count of filtered vs total talks', () => {
      const talks = [
        createTalk({ id: '1', format: 'podcast' }),
        createTalk({ id: '2', format: 'talk' }),
        createTalk({ id: '3', format: 'podcast' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('format=podcast')
      });

      expect(screen.getByText('Showing 2 of 3 talks')).toBeInTheDocument();
    });
  });

  describe('Quick Watch Filter', () => {
    it('displays Quick Watch filter button', () => {
      const talks = [
        createTalk({ id: '1', title: 'Some talk' })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />);

      // Real UI renders Quick Watch toggle button
      expect(screen.getByRole('button', { name: /toggle quick watch filter/i })).toBeInTheDocument();
    });

    it('displays Quick Watch chip when filter is active', () => {
      const talks = [
        createTalk({ id: '1', title: 'Short talk', duration: 900 })
      ];

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks,
        loading: false,
        error: null
      });

      renderIntegration(<TalksList />, {
        initialParams: new URLSearchParams('quickWatch=true')
      });

      // Real ActiveFilters shows Quick Watch chip
      expect(screen.getByRole('button', { name: /remove quick watch filter/i })).toBeInTheDocument();
    });
  });
});
