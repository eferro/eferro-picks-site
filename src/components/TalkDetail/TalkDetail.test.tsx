import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TalkDetail } from '.';
import { useTalks } from '../../hooks/useTalks';
import type { Talk } from '../../types/talks';
import { createTalk } from '../../test/builders';
import { renderWithRouter } from '../../test/router';

/**
 * Focused TalkDetail tests for details not covered by
 * TalkDetail.integration.test.tsx (rendering, notes, blog link, loading
 * and error states, navigation and the "More by" basics live there).
 */
vi.mock('../../hooks/useTalks');

const currentTalk = createTalk({
  id: '1',
  title: 'Test Talk',
  speakers: ['Test Speaker 1', 'Test Speaker 2'],
  conference_name: 'Test Conference',
  topics: ['test'],
});

const givenTalks = (talks: Talk[]) => {
  vi.mocked(useTalks).mockReturnValue({ talks, loading: false, error: null });
};

const renderTalkDetail = (params = '') =>
  renderWithRouter(<TalkDetail />, { path: '/talk/1', params, routePath: '/talk/:id' });

describe('TalkDetail', () => {
  beforeEach(() => {
    givenTalks([currentTalk]);
  });

  describe('Rating Display', () => {
    it.each([
      ['rating below 5', 4],
      ['no rating', undefined],
    ])('does not show the top rated star for a talk with %s', (_label, rating) => {
      givenTalks([{ ...currentTalk, rating }]);

      renderTalkDetail();

      expect(screen.queryByRole('img', { name: /Top rated/i })).not.toBeInTheDocument();
    });

    it('gives the top rated star a tooltip', () => {
      givenTalks([{ ...currentTalk, rating: 5 }]);

      renderTalkDetail();

      expect(screen.getByRole('img', { name: 'Top rated' })).toHaveAttribute('title', 'Top rated');
    });
  });

  describe('Metadata links', () => {
    it('preserves other filters and replaces the query in speaker links', () => {
      renderTalkDetail('yearType=specific&year=2023&query=previous search');

      expect(
        screen.getByRole('link', { name: 'See all talks by Test Speaker 1' })
      ).toHaveAttribute('href', '/?yearType=specific&year=2023&query=Test+Speaker+1');
    });

    it('preserves the current query when building the conference link', () => {
      renderTalkDetail('query=some search');

      expect(
        screen.getByRole('link', { name: 'See all talks from Test Conference' })
      ).toHaveAttribute('href', '/?conference=Test+Conference&query=some+search');
    });
  });

  it('does not render the blog link when blog_url is an empty string', () => {
    givenTalks([{ ...currentTalk, blog_url: '' }]);

    renderTalkDetail();

    expect(screen.queryByRole('link', { name: /mentioned in curator's blog/i })).not.toBeInTheDocument();
  });

  describe('More by Speaker Section', () => {
    const talkBySpeaker1 = createTalk({ id: '2', title: 'Another Talk by Speaker 1', speakers: ['Test Speaker 1'] });
    const talkBySpeaker2 = createTalk({ id: '3', title: 'Talk by Speaker 2', speakers: ['Test Speaker 2'] });

    it('excludes the current talk from the related talks list', () => {
      givenTalks([currentTalk, talkBySpeaker1]);

      renderTalkDetail();

      const relatedSection = screen.getByText(/More by/).closest('section');
      expect(relatedSection).not.toHaveTextContent('Test Talk');
      expect(relatedSection).toHaveTextContent('Another Talk by Speaker 1');
    });

    it('shows talks from any speaker of a multi-speaker talk', () => {
      givenTalks([currentTalk, talkBySpeaker1, talkBySpeaker2]);

      renderTalkDetail();

      expect(screen.getByText('Another Talk by Speaker 1')).toBeInTheDocument();
      expect(screen.getByText('Talk by Speaker 2')).toBeInTheDocument();
    });
  });
});
