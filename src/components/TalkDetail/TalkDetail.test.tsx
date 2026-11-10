import { screen, within, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import { TalkDetail } from '.';
import { TalksList } from '../TalksList';
import { useTalks } from '../../hooks/useTalks';
import type { Talk } from '../../types/talks';
import { createTalk } from '../../test/builders';
import { renderWithRouter } from '../../test/router';

// Only the data source is mocked; routing, child components and utilities
// (formatDuration, hasMeaningfulNotes, rehype-sanitize) are real.
vi.mock('../../hooks/useTalks');

const currentTalk = createTalk({
  id: 'test-123',
  title: 'Advanced TypeScript',
  speakers: ['Alice Smith', 'Bob Jones'],
  conference_name: 'NDC London',
  duration: 3600,
  topics: ['typescript', 'advanced'],
  core_topic: 'Programming Languages',
  description: 'Deep dive into TypeScript features',
  notes: 'Excellent coverage of generics and type inference',
  year: 2023,
  rating: 5,
});

const givenTalks = (talks: Talk[]) => {
  vi.mocked(useTalks).mockReturnValue({ talks, loading: false, error: null });
};

const renderTalkDetail = (params = '', id = currentTalk.id) =>
  renderWithRouter(<TalkDetail />, { path: `/talk/${id}`, params, routePath: '/talk/:id' });

/** Detail page plus the talks list, to follow links between them. */
const renderApp = () =>
  renderWithRouter(
    <Routes>
      <Route path="/" element={<TalksList />} />
      <Route path="/talk/:id" element={<TalkDetail />} />
    </Routes>,
    { path: `/talk/${currentTalk.id}` }
  );

const relatedSection = () => screen.getByRole('region', { name: 'More talks by this speaker' });

describe('TalkDetail', () => {
  beforeEach(() => {
    givenTalks([currentTalk]);
  });

  it('shows the talk information', () => {
    renderTalkDetail();

    expect(screen.getByRole('heading', { name: 'Advanced TypeScript' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all talks by Alice Smith' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all talks by Bob Jones' })).toBeInTheDocument();
    expect(screen.getByText('1h 0m')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all talks from NDC London' })).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Deep dive into TypeScript features')).toBeInTheDocument();
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
  });

  describe('Rating', () => {
    it('marks 5-star talks as top rated, with a tooltip', () => {
      renderTalkDetail();

      expect(screen.getByRole('img', { name: 'Top rated' })).toHaveAttribute('title', 'Top rated');
    });

    it.each([
      ['rating below 5', 4],
      ['no rating', undefined],
    ])('does not mark a talk with %s as top rated', (_label, rating) => {
      givenTalks([{ ...currentTalk, rating }]);

      renderTalkDetail();

      expect(screen.queryByRole('img', { name: /Top rated/i })).not.toBeInTheDocument();
    });
  });

  describe('Notes', () => {
    it('shows meaningful notes', () => {
      renderTalkDetail();

      expect(screen.getByRole('heading', { name: 'Key Notes' })).toBeInTheDocument();
      expect(screen.getByText('Excellent coverage of generics and type inference')).toBeInTheDocument();
    });

    it.each([
      ['missing', undefined],
      ['only whitespace', '   \n\t  '],
    ])('hides the notes section when notes are %s', (_label, notes) => {
      givenTalks([{ ...currentTalk, notes }]);

      renderTalkDetail();

      expect(screen.queryByRole('heading', { name: 'Key Notes' })).not.toBeInTheDocument();
    });

    it('sanitizes HTML in notes', () => {
      givenTalks([{ ...currentTalk, notes: '<script>alert("xss")</script><img src=x onerror="alert(1)">' }]);

      const { container } = renderTalkDetail();

      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('img[onerror]')).toBeNull();
    });
  });

  describe('Blog link', () => {
    it('links to the blog post in a new tab', () => {
      givenTalks([{ ...currentTalk, blog_url: 'https://blog.example.com/post' }]);

      renderTalkDetail();

      const blogLink = screen.getByRole('link', { name: /mentioned in curator's blog/i });
      expect(blogLink).toHaveAttribute('href', 'https://blog.example.com/post');
      expect(blogLink).toHaveAttribute('target', '_blank');
    });

    it.each([
      ['absent', undefined],
      ['empty', ''],
    ])('is hidden when blog_url is %s', (_label, blog_url) => {
      givenTalks([{ ...currentTalk, blog_url }]);

      renderTalkDetail();

      // By text: an <a> without href would not even be exposed as a link
      expect(screen.queryByText(/mentioned in curator's blog/i)).not.toBeInTheDocument();
    });
  });

  describe('Back link', () => {
    it.each([
      ['rating=5&hasNotes=true&yearType=last2', '/?yearType=last2&hasNotes=true&rating=5'],
      ['query=TypeScript', '/?query=TypeScript'],
      ['', '/'],
    ])('returns to the list keeping the filters "%s"', (params, href) => {
      renderTalkDetail(params);

      expect(screen.getByRole('link', { name: /back to talks/i })).toHaveAttribute('href', href);
    });
  });

  describe('Metadata links', () => {
    it('preserves other filters and replaces the query in speaker links', () => {
      renderTalkDetail('yearType=specific&year=2023&query=previous search');

      expect(screen.getByRole('link', { name: 'See all talks by Alice Smith' }))
        .toHaveAttribute('href', '/?yearType=specific&year=2023&query=Alice+Smith');
    });

    it('preserves the current query when building the conference link', () => {
      renderTalkDetail('query=some search');

      expect(screen.getByRole('link', { name: 'See all talks from NDC London' }))
        .toHaveAttribute('href', '/?conference=NDC+London&query=some+search');
    });

    describe('following them to the talks list', () => {
      const unrelatedTalk = createTalk({
        id: 'other-1',
        title: 'Unrelated Talk',
        speakers: ['Carol White'],
        conference_name: 'Other Conf',
        topics: ['python'],
      });

      beforeEach(() => {
        givenTalks([currentTalk, unrelatedTalk]);
      });

      it.each([
        ['speaker', 'See all talks by Alice Smith', 'Remove search filter'],
        ['topic', 'See all talks about typescript', 'Remove search filter'],
        ['conference', 'See all talks from NDC London', /^NDC London\s*×$/],
      ])('lists only the talks of the clicked %s', async (_kind, linkName, chipName) => {
        renderApp();

        fireEvent.click(screen.getByRole('link', { name: linkName }));

        await waitFor(() => expect(screen.getByRole('button', { name: chipName })).toBeInTheDocument());
        expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
        expect(screen.queryByText('Unrelated Talk')).not.toBeInTheDocument();
      });

      it('lets the user clear that filter to see every talk again', async () => {
        renderApp();
        fireEvent.click(screen.getByRole('link', { name: 'See all talks by Alice Smith' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Remove search filter' })).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'Remove search filter' }));

        await waitFor(() => expect(screen.getAllByText('Unrelated Talk').length).toBeGreaterThan(0));
        expect(screen.queryByRole('button', { name: 'Remove search filter' })).not.toBeInTheDocument();
      });
    });
  });

  describe('More by the same speakers', () => {
    const byAlice = createTalk({ id: 'other-1', title: 'Another TypeScript Talk', speakers: ['Alice Smith'], duration: 1800, year: 2022 });
    const byBob = createTalk({ id: 'other-2', title: 'JavaScript Patterns', speakers: ['Bob Jones'] });
    const byCarol = createTalk({ id: 'other-3', title: 'Python Basics', speakers: ['Carol White'] });

    it('lists talks by any speaker of the current talk, excluding the current and unrelated ones', () => {
      givenTalks([currentTalk, byAlice, byBob, byCarol]);

      renderTalkDetail();

      const titles = within(relatedSection()).getAllByRole('link').map(link => within(link).getByRole('heading').textContent);
      expect(titles).toEqual(['Another TypeScript Talk', 'JavaScript Patterns']);
    });

    it('names every speaker in the heading', () => {
      givenTalks([currentTalk, byAlice]);

      renderTalkDetail();

      expect(within(relatedSection()).getByRole('heading', { level: 2 }))
        .toHaveTextContent('More by Alice Smith & Bob Jones');
    });

    it('shows duration and year of each related talk', () => {
      givenTalks([currentTalk, byAlice]);

      renderTalkDetail();

      expect(within(relatedSection()).getByText('30m')).toBeInTheDocument();
      expect(within(relatedSection()).getByText('2022')).toBeInTheDocument();
    });

    it('links each related talk to its own detail page, keeping the filters', () => {
      givenTalks([currentTalk, byAlice]);

      renderTalkDetail('hasNotes=true&query=tdd');

      expect(within(relatedSection()).getByRole('link', { name: /Another TypeScript Talk/ }))
        .toHaveAttribute('href', '/talk/other-1?hasNotes=true&query=tdd');
    });

    it('shows at most 5 related talks', () => {
      const many = Array.from({ length: 10 }, (_, i) =>
        createTalk({ id: `related-${i}`, title: `Related Talk ${i}`, speakers: ['Alice Smith'] })
      );
      givenTalks([currentTalk, ...many]);

      renderTalkDetail();

      expect(within(relatedSection()).getAllByRole('link')).toHaveLength(5);
    });

    it('is hidden when the speakers have no other talks', () => {
      givenTalks([currentTalk, byCarol]);

      renderTalkDetail();

      expect(screen.queryByRole('region', { name: 'More talks by this speaker' })).not.toBeInTheDocument();
    });
  });

  describe('Loading, error and not found', () => {
    it('announces the loading state', () => {
      vi.mocked(useTalks).mockReturnValue({ talks: [], loading: true, error: null });

      renderTalkDetail();

      expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    it('shows an error message when loading fails', () => {
      vi.mocked(useTalks).mockReturnValue({ talks: [], loading: false, error: new Error('Network error') });

      renderTalkDetail();

      expect(screen.getByText(/error loading talk details/i)).toBeInTheDocument();
    });

    it('says the talk was not found for an unknown id', () => {
      renderTalkDetail('', 'non-existent');

      expect(screen.getByText(/talk not found/i)).toBeInTheDocument();
    });
  });
});
