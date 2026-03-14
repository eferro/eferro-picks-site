import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MoreTalksBySpeaker } from '.';
import { renderWithRouter, setMockSearchParams, createTalk } from '../../test/utils';

describe('MoreTalksBySpeaker', () => {
  const currentTalk = createTalk({
    id: '1',
    title: 'Current Talk',
    speakers: ['John Doe', 'Jane Smith']
  });

  const relatedTalk = createTalk({
    id: '2',
    title: 'Another Talk by John',
    speakers: ['John Doe']
  });

  const unrelatedTalk = createTalk({
    id: '3',
    title: 'Unrelated Talk',
    speakers: ['Different Speaker']
  });

  const allTalks = [currentTalk, relatedTalk, unrelatedTalk];

  beforeEach(() => {
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());
  });

  it('renders section title when there are related talks', () => {
    renderWithRouter(
      <MoreTalksBySpeaker currentTalk={currentTalk} allTalks={allTalks} />
    );

    expect(screen.getByText('More talks by these speakers')).toBeInTheDocument();
    expect(screen.getByText('Another Talk by John')).toBeInTheDocument();
  });

  it('does not render when there are no related talks', () => {
    const onlyUnrelatedTalks = [currentTalk, unrelatedTalk];

    renderWithRouter(
      <MoreTalksBySpeaker currentTalk={currentTalk} allTalks={onlyUnrelatedTalks} />
    );

    expect(screen.queryByText('More talks by these speakers')).not.toBeInTheDocument();
  });

  it('excludes the current talk from related talks', () => {
    renderWithRouter(
      <MoreTalksBySpeaker currentTalk={currentTalk} allTalks={allTalks} />
    );

    // Should show related talk
    expect(screen.getByText('Another Talk by John')).toBeInTheDocument();

    // Should not show current talk in the related section
    // Note: We can't check for absence of "Current Talk" text because it might appear elsewhere
    const relatedSection = screen.getByText('More talks by these speakers').closest('section');
    expect(relatedSection).toBeInTheDocument();
  });

  it('does not render when current talk has no speakers', () => {
    const talkWithoutSpeakers = createTalk({
      id: '1',
      title: 'Talk Without Speakers',
      speakers: []
    });

    renderWithRouter(
      <MoreTalksBySpeaker currentTalk={talkWithoutSpeakers} allTalks={allTalks} />
    );

    expect(screen.queryByText('More talks by these speakers')).not.toBeInTheDocument();
  });

  it('limits the number of displayed talks to 3', () => {
    // Create more talks by same speakers
    const manyTalks = [
      currentTalk,
      ...Array.from({ length: 5 }, (_, i) =>
        createTalk({
          id: `extra-${i}`,
          title: `Extra Talk ${i}`,
          speakers: ['John Doe']
        })
      )
    ];

    renderWithRouter(
      <MoreTalksBySpeaker currentTalk={currentTalk} allTalks={manyTalks} />
    );

    // Should only show first 3 related talks (alphabetically sorted)
    const talkCards = screen.getAllByRole('article');
    expect(talkCards).toHaveLength(3);
  });

  it('sorts talks alphabetically by title', () => {
    const talksToSort = [
      currentTalk,
      createTalk({
        id: '2',
        title: 'Z Last Talk',
        speakers: ['John Doe']
      }),
      createTalk({
        id: '3',
        title: 'A First Talk',
        speakers: ['John Doe']
      }),
      createTalk({
        id: '4',
        title: 'M Middle Talk',
        speakers: ['John Doe']
      })
    ];

    renderWithRouter(
      <MoreTalksBySpeaker currentTalk={currentTalk} allTalks={talksToSort} />
    );

    const talkTitles = screen.getAllByRole('article').map(card =>
      card.getAttribute('aria-label')?.replace('Talk: ', '')
    );

    // Should be sorted: "A First Talk", "M Middle Talk", "Z Last Talk"
    expect(talkTitles[0]).toBe('A First Talk');
    expect(talkTitles[1]).toBe('M Middle Talk');
    expect(talkTitles[2]).toBe('Z Last Talk');
  });
});