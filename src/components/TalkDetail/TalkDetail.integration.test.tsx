import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderIntegration } from '../../test/integration/IntegrationTestHelpers';
import { TalkDetail } from '.';
import { TalksList } from '../TalksList';
import { useTalks } from '../../hooks/useTalks';
import { createTalk } from '../../test/utils';
import { Routes, Route } from 'react-router-dom';

/**
 * TalkDetail Integration Tests
 *
 * APPROACH: Test real user workflows with minimal mocking
 * - Mock only useTalks (data boundary)
 * - Use real child components (MoreTalksBySpeaker, etc.)
 * - Use real utilities (hasMeaningfulNotes, formatDuration)
 * - Verify user-visible behavior
 *
 * BENEFITS:
 * - Tests survive refactoring
 * - Catch integration bugs
 * - Higher confidence
 */

// Mock only the data boundary
vi.mock('../../hooks/useTalks');

describe('TalkDetail Integration', () => {
  const mockTalk = createTalk({
    id: 'test-123',
    title: 'Advanced TypeScript',
    speakers: ['Alice Smith', 'Bob Jones'],
    conference_name: 'NDC London',
    duration: 3600,
    topics: ['typescript', 'advanced'],
    core_topic: 'Programming Languages',
    url: 'https://example.com/talk',
    description: 'Deep dive into TypeScript features',
    notes: 'Excellent coverage of generics and type inference',
    year: 2023,
    rating: 5
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Talk Display', () => {
    it('renders complete talk information', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      // Verify all key information is visible
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.getByText('1h 0m')).toBeInTheDocument(); // Real formatDuration
      expect(screen.getByText('NDC London')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getByText('Deep dive into TypeScript features')).toBeInTheDocument();
    });

    it('shows top rated indicator for 5-star talks', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      expect(screen.getByRole('img', { name: /top rated/i })).toBeInTheDocument();
    });

    it('does not show top rated indicator for non-5-star talks', () => {
      const regularTalk = createTalk({ rating: 4 });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [regularTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: `/talk/${regularTalk.id}`
        }
      );

      expect(screen.queryByRole('img', { name: /top rated/i })).not.toBeInTheDocument();
    });
  });

  describe('Notes Section', () => {
    it('displays notes section when talk has meaningful notes', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      // Real hasMeaningfulNotes utility determines visibility
      expect(screen.getByText('Key Notes')).toBeInTheDocument();
      expect(screen.getByText('Excellent coverage of generics and type inference')).toBeInTheDocument();
    });

    it('hides notes section when notes are empty', () => {
      const talkNoNotes = createTalk({ notes: undefined });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [talkNoNotes],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: `/talk/${talkNoNotes.id}`
        }
      );

      expect(screen.queryByText('Key Notes')).not.toBeInTheDocument();
    });

    it('hides notes section when notes are only whitespace', () => {
      const talkWhitespace = createTalk({ notes: '   \n\t  ' });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [talkWhitespace],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: `/talk/${talkWhitespace.id}`
        }
      );

      // Real hasMeaningfulNotes utility filters whitespace
      expect(screen.queryByText('Key Notes')).not.toBeInTheDocument();
    });

    it('sanitizes HTML in notes for security', () => {
      const maliciousTalk = createTalk({
        notes: '<script>alert("xss")</script><img src=x onerror="alert(1)">'
      });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [maliciousTalk],
        loading: false,
        error: null
      });

      const { container } = renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: `/talk/${maliciousTalk.id}`
        }
      );

      // Real rehype-sanitize plugin prevents XSS
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('img[onerror]')).toBeNull();
    });
  });

  describe('Blog Link', () => {
    it('shows blog link when blog_url is present', () => {
      const talkWithBlog = createTalk({
        blog_url: 'https://blog.example.com/post'
      });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [talkWithBlog],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: `/talk/${talkWithBlog.id}`
        }
      );

      const blogLink = screen.getByRole('link', { name: /mentioned in curator's blog/i });
      expect(blogLink).toBeInTheDocument();
      expect(blogLink).toHaveAttribute('href', 'https://blog.example.com/post');
      expect(blogLink).toHaveAttribute('target', '_blank');
    });

    it('hides blog link when blog_url is absent', () => {
      const talkNoBlog = createTalk({ blog_url: undefined });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [talkNoBlog],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: `/talk/${talkNoBlog.id}`
        }
      );

      expect(screen.queryByRole('link', { name: /mentioned in curator's blog/i })).not.toBeInTheDocument();
    });
  });

  describe('Metadata Navigation', () => {
    const otherTalk = createTalk({
      id: 'other-1',
      title: 'Unrelated Talk',
      speakers: ['Carol White'],
      conference_name: 'Other Conf',
      topics: ['python']
    });

    const renderDetailWithList = () =>
      renderIntegration(
        <Routes>
          <Route path="/" element={<TalksList />} />
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

    beforeEach(() => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk, otherTalk],
        loading: false,
        error: null
      });
    });

    it('clicking a speaker navigates to the talks list filtered by that speaker', async () => {
      renderDetailWithList();

      fireEvent.click(
        screen.getByRole('link', { name: 'See all talks by Alice Smith' })
      );

      // Lands on the list, filtered and with a visible removable chip
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /remove search filter/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText('Search:')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      expect(screen.queryByText('Unrelated Talk')).not.toBeInTheDocument();
    });

    it('clicking a topic navigates to the talks list filtered by that topic', async () => {
      renderDetailWithList();

      fireEvent.click(
        screen.getByRole('link', { name: 'See all talks about typescript' })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /remove search filter/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      expect(screen.queryByText('Unrelated Talk')).not.toBeInTheDocument();
    });

    it('clicking the conference navigates to the talks list filtered by that conference', async () => {
      renderDetailWithList();

      fireEvent.click(
        screen.getByRole('link', { name: 'See all talks from NDC London' })
      );

      await waitFor(() => {
        expect(screen.getByText('Conference:')).toBeInTheDocument();
      });
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      expect(screen.queryByText('Unrelated Talk')).not.toBeInTheDocument();
    });
  });

  describe('Navigation with Filter Preservation', () => {
    it('preserves all filters when navigating back to talks list', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk],
        loading: false,
        error: null
      });

      // View talk detail with active filters
      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123',
          initialParams: new URLSearchParams('rating=5&hasNotes=true&yearType=last2')
        }
      );

      // Check back link preserves all filters
      const backLink = screen.getByRole('link', { name: /back to talks/i });
      expect(backLink).toHaveAttribute('href', expect.stringContaining('rating=5'));
      expect(backLink).toHaveAttribute('href', expect.stringContaining('hasNotes=true'));
      expect(backLink).toHaveAttribute('href', expect.stringContaining('yearType=last2'));
    });

    it('preserves search query in navigation', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123',
          initialParams: new URLSearchParams('query=TypeScript')
        }
      );

      const backLink = screen.getByRole('link', { name: /back to talks/i });
      expect(backLink).toHaveAttribute('href', expect.stringContaining('query=TypeScript'));
    });
  });

  describe('More by Speaker Section', () => {
    it('displays related talks from the same speakers', () => {
      const otherTalkBySpeaker1 = createTalk({
        id: 'other-1',
        title: 'Another TypeScript Talk',
        speakers: ['Alice Smith'],
        duration: 1800,
        year: 2022
      });

      const otherTalkBySpeaker2 = createTalk({
        id: 'other-2',
        title: 'JavaScript Patterns',
        speakers: ['Bob Jones'],
        duration: 2700,
        year: 2021
      });

      const unrelatedTalk = createTalk({
        id: 'other-3',
        title: 'Python Basics',
        speakers: ['Carol White']
      });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk, otherTalkBySpeaker1, otherTalkBySpeaker2, unrelatedTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      // Section should appear
      expect(screen.getByText(/More by/)).toBeInTheDocument();

      // Related talks should be visible
      expect(screen.getByText('Another TypeScript Talk')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Patterns')).toBeInTheDocument();

      // Unrelated talk should not appear
      expect(screen.queryByText('Python Basics')).not.toBeInTheDocument();

      // Current talk should not appear in related section
      const relatedSection = screen.getByText(/More by/).closest('section');
      const relatedLinks = relatedSection?.querySelectorAll('a[href*="/talk/"]');
      const currentTalkInRelated = Array.from(relatedLinks || []).some(
        link => link.textContent?.includes('Advanced TypeScript')
      );
      expect(currentTalkInRelated).toBe(false);
    });

    it('hides section when no other talks by speaker exist', () => {
      const unrelatedTalk = createTalk({
        id: 'other-1',
        title: 'Unrelated Talk',
        speakers: ['Different Speaker']
      });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk, unrelatedTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      expect(screen.queryByText(/More by/)).not.toBeInTheDocument();
    });

    it('displays duration and year for related talks', () => {
      const relatedTalk = createTalk({
        id: 'related-1',
        title: 'Related Talk',
        speakers: ['Alice Smith'],
        duration: 1800, // 30 minutes
        year: 2022
      });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk, relatedTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      // Real formatDuration utility
      expect(screen.getByText('30m')).toBeInTheDocument();
      expect(screen.getByText('2022')).toBeInTheDocument();
    });

    it('limits related talks to maximum of 5', () => {
      const manyRelatedTalks = Array.from({ length: 10 }, (_, i) =>
        createTalk({
          id: `related-${i}`,
          title: `Related Talk ${i}`,
          speakers: ['Alice Smith'],
          duration: 1800,
          year: 2020 + i
        })
      );

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk, ...manyRelatedTalks],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      const relatedSection = screen.getByText(/More by/).closest('section');
      const relatedLinks = relatedSection?.querySelectorAll('a[href*="/talk/"]');
      expect(relatedLinks?.length).toBeLessThanOrEqual(5);
    });

    it('related talk links preserve current filters', () => {
      const relatedTalk = createTalk({
        id: 'related-1',
        title: 'Related Talk',
        speakers: ['Alice Smith']
      });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk, relatedTalk],
        loading: false,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123',
          initialParams: new URLSearchParams('rating=5&hasNotes=true')
        }
      );

      const relatedLink = screen.getByText('Related Talk').closest('a');
      expect(relatedLink).toHaveAttribute('href', expect.stringContaining('rating=5'));
      expect(relatedLink).toHaveAttribute('href', expect.stringContaining('hasNotes=true'));
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading spinner while fetching', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [],
        loading: true,
        error: null
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error message on fetch failure', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [],
        loading: false,
        error: new Error('Network error')
      });

      renderIntegration(
        <Routes>
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      expect(screen.getByText(/error loading talk details/i)).toBeInTheDocument();
    });

    it('shows not found message when talk ID does not exist', () => {
      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk],
        loading: false,
        error: null
      });

      renderIntegration(<TalkDetail />, {
        initialPath: '/talk/non-existent',
        withRoutes: true
      });

      expect(screen.getByText(/talk not found/i)).toBeInTheDocument();
    });
  });

  describe('Complete User Journey', () => {
    it('user views a talk, jumps to all talks by its speaker, and clears the filter', async () => {
      const unrelatedTalk = createTalk({
        id: 'unrelated-1',
        title: 'Unrelated Talk',
        speakers: ['Carol White']
      });

      (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
        talks: [mockTalk, unrelatedTalk],
        loading: false,
        error: null
      });

      // User views talk detail
      renderIntegration(
        <Routes>
          <Route path="/" element={<TalksList />} />
          <Route path="/talk/:id" element={<TalkDetail />} />
        </Routes>,
        {
          initialPath: '/talk/test-123'
        }
      );

      // User clicks a speaker and lands on the filtered list
      fireEvent.click(
        screen.getByRole('link', { name: 'See all talks by Alice Smith' })
      );

      await waitFor(() => {
        expect(screen.getByText('Search:')).toBeInTheDocument();
      });
      expect(screen.queryByText('Unrelated Talk')).not.toBeInTheDocument();

      // User removes the filter and sees the full collection again
      fireEvent.click(
        screen.getByRole('button', { name: /remove search filter/i })
      );

      await waitFor(() => {
        expect(screen.getAllByText('Unrelated Talk').length).toBeGreaterThanOrEqual(1);
      });
      expect(screen.queryByText('Search:')).not.toBeInTheDocument();
    });
  });
});
