import { screen, fireEvent, within, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TalksList } from '.';
import { useTalks } from '../../hooks/useTalks';
import type { Talk } from '../../types/talks';
import { createTalk } from '../../test/builders';
import { renderWithRouter, currentParams } from '../../test/router';

// Only the data source is mocked: child components, URL state and
// filtering are real, so assertions are on what the user sees.
vi.mock('../../hooks/useTalks');

const givenTalks = (talks: Talk[]) => {
  vi.mocked(useTalks).mockReturnValue({ talks, loading: false, error: null });
};

const renderTalksList = (params = '') => renderWithRouter(<TalksList />, { params });

/** Titles of the talks listed in the topic sections (excludes Recently Added). */
const listedTitles = () =>
  screen.queryAllByTestId('talk-section').flatMap(section =>
    within(section).getAllByRole('article').map(card => card.getAttribute('aria-label')?.replace('Talk: ', ''))
  );

const sectionHeadings = () =>
  screen.queryAllByTestId('talk-section').map(section => within(section).getByRole('heading', { level: 2 }).textContent);

const openYearMenu = async () => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /filter by year/i }));
  });
};

describe('TalksList', () => {
  beforeEach(() => {
    givenTalks([]);
  });

  describe('Loading and error states', () => {
    it('announces the loading state to screen readers', () => {
      vi.mocked(useTalks).mockReturnValue({ talks: [], loading: true, error: null });

      renderTalksList();

      expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    it('shows the error message when loading fails', () => {
      vi.mocked(useTalks).mockReturnValue({ talks: [], loading: false, error: new Error('Boom') });

      renderTalksList();

      expect(screen.getByText(/Boom/)).toBeInTheDocument();
    });
  });

  describe('Sections by core topic', () => {
    const categorized = [
      createTalk({ id: '4', title: 'A1', core_topic: 'Agile' }),
      createTalk({ id: '5', title: 'D1', core_topic: 'DevOps' }),
      createTalk({ id: '6', title: 'D2', core_topic: 'DevOps' }),
    ];
    const uncategorized = [
      createTalk({ id: '1', title: 'U1', core_topic: '' }),
      createTalk({ id: '2', title: 'U2', core_topic: '' }),
      createTalk({ id: '3', title: 'U3', core_topic: '' }),
    ];

    // Both input orders, so the comparator must handle Uncategorized on either side
    it.each([
      ['first', [...uncategorized, ...categorized]],
      ['last', [...categorized, ...uncategorized]],
    ])('groups talks by core topic, largest first and Uncategorized last (Uncategorized %s in data)', (_label, talks) => {
      givenTalks(talks);

      renderTalksList();

      expect(sectionHeadings()).toEqual(['DevOps (2)', 'Agile (1)', 'Uncategorized (3)']);
    });

    it('shows the results count', () => {
      givenTalks([
        createTalk({ id: '1', notes: 'Notes' }),
        createTalk({ id: '2', notes: undefined }),
      ]);

      renderTalksList('hasNotes=true');

      expect(screen.getByText('Showing 1 of 2 talks')).toBeInTheDocument();
    });

    it('shows an empty state when no talk matches', () => {
      givenTalks([createTalk({ id: '1', notes: undefined })]);

      renderTalksList('hasNotes=true');

      expect(screen.getByText('No talks found matching your criteria.')).toBeInTheDocument();
    });
  });

  describe('Category index', () => {
    const twoCategories = [
      createTalk({ id: '1', core_topic: 'Agile' }),
      createTalk({ id: '2', core_topic: 'DevOps' }),
    ];

    it('is hidden when there is only one category', () => {
      givenTalks([createTalk({ id: '1', core_topic: 'Agile' })]);

      renderTalksList();

      expect(screen.queryByRole('navigation', { name: 'Category navigation' })).not.toBeInTheDocument();
    });

    it('scrolls to the section of the clicked category', () => {
      givenTalks(twoCategories);
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView;

      renderTalksList();
      const nav = screen.getByRole('navigation', { name: 'Category navigation' });
      fireEvent.click(within(nav).getByRole('button', { name: /DevOps/ }));

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.contexts[0]).toHaveAttribute('data-category', 'DevOps');
    });
  });

  describe('Toggle filters', () => {
    const talks = [
      createTalk({ id: '1', title: 'Top short talk with notes', rating: 5, duration: 600, notes: 'Notes' }),
      createTalk({ id: '2', title: 'Long talk', rating: 3, duration: 3600, notes: undefined }),
    ];

    beforeEach(() => {
      givenTalks(talks);
    });

    it.each([
      ['Top Picks', 'rating', '5'],
      ['Has Notes', 'hasNotes', 'true'],
      ['Quick Watch', 'quickWatch', 'true'],
    ])('activating %s updates the URL, the button state and the list', (name, param, value) => {
      renderTalksList();
      const toggle = () => screen.getByRole('button', { name: new RegExp(`toggle ${name} filter`, 'i') });
      expect(toggle()).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(toggle());

      expect(currentParams().get(param)).toBe(value);
      expect(toggle()).toHaveAttribute('aria-pressed', 'true');
      expect(listedTitles()).toEqual(['Top short talk with notes']);
    });

    it.each([
      ['Top Picks', 'rating=5', 'rating'],
      ['Has Notes', 'hasNotes=true', 'hasNotes'],
      ['Quick Watch', 'quickWatch=true', 'quickWatch'],
    ])('deactivating %s removes it from the URL and shows all talks', (name, params, param) => {
      renderTalksList(params);

      fireEvent.click(screen.getByRole('button', { name: new RegExp(`toggle ${name} filter`, 'i') }));

      expect(currentParams().get(param)).toBeNull();
      expect(listedTitles()).toEqual(['Top short talk with notes', 'Long talk']);
    });

    it('shows the active star label for Top Picks', () => {
      renderTalksList('rating=5');

      expect(screen.getByRole('button', { name: /toggle top picks filter/i })).toHaveTextContent('⭐ Top Picks');
    });

    it('explains Top Picks in a tooltip', () => {
      renderTalksList();

      expect(screen.getByRole('button', { name: /toggle top picks filter/i }))
        .toHaveAttribute('title', "Show only 5-star talks — the curator's top recommendations");
    });
  });

  describe('Browsing from talk cards', () => {
    const talks = [
      createTalk({ id: '1', title: 'React at scale', topics: ['react'], conference_name: 'ReactConf' }),
      createTalk({ id: '2', title: 'Lean delivery', topics: ['lean'], conference_name: 'LeanConf' }),
    ];
    const inList = () => within(screen.getAllByTestId('talk-section')[0]);

    beforeEach(() => {
      givenTalks(talks);
    });

    it('filters by a topic clicked on a card and marks it as selected', () => {
      renderTalksList();

      fireEvent.click(inList().getByRole('button', { name: 'Filter by topic react' }));

      expect(currentParams().get('query')).toBe('react');
      expect(listedTitles()).toEqual(['React at scale']);
      expect(inList().getByRole('button', { name: 'Filter by topic react' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('clears the query when the selected topic is clicked again', () => {
      renderTalksList('query=react');

      fireEvent.click(inList().getByRole('button', { name: 'Filter by topic react' }));

      expect(currentParams().get('query')).toBeNull();
      expect(listedTitles()).toEqual(['React at scale', 'Lean delivery']);
    });

    it('filters by a conference clicked on a card and marks it as selected', () => {
      renderTalksList();

      fireEvent.click(inList().getByRole('button', { name: 'Filter by conference LeanConf' }));

      expect(currentParams().get('conference')).toBe('LeanConf');
      expect(listedTitles()).toEqual(['Lean delivery']);
      expect(inList().getByRole('button', { name: 'Filter by conference LeanConf' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('removes the conference filter from its chip', () => {
      renderTalksList('conference=LeanConf');

      fireEvent.click(screen.getByRole('button', { name: /^LeanConf\s*×$/ }));

      expect(currentParams().get('conference')).toBeNull();
      expect(listedTitles()).toEqual(['React at scale', 'Lean delivery']);
    });

    it('filters by a topic clicked in the Recently Added section', () => {
      renderTalksList();
      const recentlyAdded = within(screen.getByRole('region', { name: 'Recently added talks' }));

      fireEvent.click(recentlyAdded.getAllByRole('button', { name: 'Filter by topic lean' })[0]);

      expect(currentParams().get('query')).toBe('lean');
      expect(listedTitles()).toEqual(['Lean delivery']);
    });
  });

  describe('Format filter', () => {
    it('shows only podcasts after selecting Podcasts', () => {
      givenTalks([
        createTalk({ id: '1', title: 'A talk', format: 'talk' }),
        createTalk({ id: '2', title: 'A podcast', format: 'podcast' }),
      ]);
      renderTalksList();

      fireEvent.click(screen.getByRole('button', { name: /format/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /podcasts/i }));

      expect(currentParams().get('format')).toBe('podcast');
      expect(listedTitles()).toEqual(['A podcast']);
    });
  });

  describe('Year filter', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('selecting "Last 2 Years" sets a relative year filter without a year', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2024, 5, 15));
      givenTalks([
        createTalk({ id: '1', title: 'Recent', year: 2023 }),
        createTalk({ id: '2', title: 'Old', year: 2015 }),
      ]);
      renderTalksList();

      await openYearMenu();
      fireEvent.click(screen.getByRole('menuitem', { name: 'Last 2 Years' }));

      expect(currentParams().get('yearType')).toBe('last2');
      expect(currentParams().get('year')).toBeNull();
      expect(listedTitles()).toEqual(['Recent']);
    });

    it.each([
      ['yearType=last2', 'Last 2 Years'],
      ['yearType=last5', 'Last 5 Years'],
      ['yearType=specific&year=2023', '2023'],
      ['yearType=before&year=2020', 'Before 2020'],
      ['yearType=after&year=2020', 'After 2020'],
    ])('removing the "%s" chip clears year and yearType', (params, chipLabel) => {
      givenTalks([createTalk({ id: '1', year: 2023 })]);
      renderTalksList(params);

      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${chipLabel}\\s*×$`) }));

      expect(currentParams().get('year')).toBeNull();
      expect(currentParams().get('yearType')).toBeNull();
    });

    it('keeps other filters when removing the year chip', () => {
      givenTalks([createTalk({ id: '1', year: 2024, notes: 'Great talk' })]);
      renderTalksList('yearType=last2&hasNotes=true');

      fireEvent.click(screen.getByRole('button', { name: /^Last 2 Years\s*×$/ }));

      expect(currentParams().toString()).toBe('hasNotes=true');
    });
  });

  describe('Search', () => {
    it('filters the list by the submitted query', () => {
      givenTalks([
        createTalk({ id: '1', title: 'React Testing', speakers: ['Alice'], topics: ['react'] }),
        createTalk({ id: '2', title: 'Vue Basics', speakers: ['Bob'], topics: ['vue'] }),
      ]);
      renderTalksList();

      fireEvent.change(screen.getByPlaceholderText(/search in titles, speakers, topics/i), {
        target: { value: 'Alice react' },
      });
      fireEvent.submit(screen.getByTestId('search-form'));

      expect(currentParams().toString()).toBe('query=Alice+react');
      expect(listedTitles()).toEqual(['React Testing']);
    });
  });

  describe('Recently Added', () => {
    const recentTalk = createTalk({
      id: '1',
      title: 'Recent Talk',
      registered_at: '2023-11-01T00:00:00Z',
      year: 2023,
      notes: 'Some notes',
    });

    it('is shown when no filters are active', () => {
      givenTalks([recentTalk]);

      renderTalksList();

      expect(screen.getByRole('region', { name: 'Recently added talks' })).toBeInTheDocument();
    });

    it.each(['hasNotes=true', 'query=recent', 'yearType=last5', 'rating=5'])(
      'is hidden when a filter is active (%s)',
      (params) => {
        givenTalks([{ ...recentTalk, rating: 5 }]);

        renderTalksList(params);

        expect(screen.queryByRole('region', { name: 'Recently added talks' })).not.toBeInTheDocument();
      }
    );
  });
});
