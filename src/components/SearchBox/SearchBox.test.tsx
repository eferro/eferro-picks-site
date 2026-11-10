import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSearchParams } from 'react-router-dom';
import { renderWithRouter, currentParams } from '../../test/router';
import { createTalk } from '../../test/builders';
import { SearchBox } from './index';

const talks = [
  createTalk({ speakers: ['Alice'], topics: ['react'] }),
  createTalk({ speakers: ['Bob'], topics: ['javascript', 'redux'] }),
];

const searchBox = () => screen.getByRole('combobox', { name: 'Search talks' });
const typeInto = (value: string) => fireEvent.change(searchBox(), { target: { value } });
const press = (key: string) => fireEvent.keyDown(searchBox(), { key });
const options = () => screen.queryAllByRole('option');

describe('SearchBox', () => {
  describe('accessibility', () => {
    it('is a labelled combobox inside a search landmark', () => {
      renderWithRouter(<SearchBox talks={talks} />);

      expect(within(screen.getByRole('search')).getByRole('combobox')).toBe(searchBox());
      expect(searchBox()).toHaveAttribute('aria-autocomplete', 'list');
      expect(searchBox()).toHaveAttribute('aria-expanded', 'false');
    });

    it('keeps the descriptive placeholder', () => {
      renderWithRouter(<SearchBox talks={talks} />);

      expect(screen.getByPlaceholderText(/search in titles/i)).toBe(searchBox());
    });

    it('exposes the suggestions as a listbox controlled by the input', () => {
      renderWithRouter(<SearchBox talks={talks} />);

      typeInto('re');

      expect(searchBox()).toHaveAttribute('aria-expanded', 'true');
      const listbox = screen.getByRole('listbox');
      expect(searchBox()).toHaveAttribute('aria-controls', listbox.id);
    });
  });

  describe('suggestions', () => {
    it('suggests speakers and topics matching the last word typed', () => {
      renderWithRouter(<SearchBox talks={talks} />);

      typeInto('hello re');

      expect(options().map(o => o.textContent)).toEqual(['🏷️ react', '🏷️ redux']);
    });

    it('marks speakers and topics with different icons', () => {
      renderWithRouter(<SearchBox talks={talks} />);

      typeInto('Ali');

      expect(screen.getByRole('option', { name: /Alice/ })).toHaveTextContent('👤');
    });

    it.each([
      ['an empty input', ''],
      ['input that matches nothing', 'xyznonexistent'],
    ])('shows none for %s', (_case, value) => {
      renderWithRouter(<SearchBox talks={talks} />);

      typeInto(value);

      expect(options()).toHaveLength(0);
      expect(searchBox()).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows at most 10', () => {
      const manySpeakers = Array.from({ length: 12 }, (_, i) => createTalk({ speakers: [`Speaker ${i}`], topics: [] }));
      renderWithRouter(<SearchBox talks={manySpeakers} />);

      typeInto('Speaker');

      expect(options()).toHaveLength(10);
    });

    it('replaces the last word with the clicked suggestion and closes the list', () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('hello rea');

      fireEvent.click(screen.getByRole('option', { name: /react/ }));

      expect(searchBox()).toHaveValue('hello react');
      expect(options()).toHaveLength(0);
    });
  });

  describe('keyboard', () => {
    it('moves the highlighted suggestion with the arrow keys', () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('re');

      press('ArrowDown');
      expect(screen.getByRole('option', { name: /react/ })).toHaveAttribute('aria-selected', 'true');
      expect(searchBox()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: /react/ }).id);

      press('ArrowDown');
      expect(screen.getByRole('option', { name: /redux/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: /react/ })).toHaveAttribute('aria-selected', 'false');

      press('ArrowUp');
      expect(screen.getByRole('option', { name: /react/ })).toHaveAttribute('aria-selected', 'true');
    });

    it('does not move past the first or last suggestion', () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('re');

      press('ArrowDown');
      press('ArrowDown');
      press('ArrowDown');
      expect(screen.getByRole('option', { name: /redux/ })).toHaveAttribute('aria-selected', 'true');

      press('ArrowUp');
      press('ArrowUp');
      press('ArrowUp');
      expect(screen.getByRole('option', { name: /react/ })).toHaveAttribute('aria-selected', 'true');
    });

    it('accepts the highlighted suggestion with Enter without searching yet', () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('hello re');

      press('ArrowDown');
      press('Enter');

      expect(searchBox()).toHaveValue('hello react');
      expect(options()).toHaveLength(0);
      expect(currentParams().get('query')).toBeNull();
    });

    it('drops the highlight when the user keeps typing, so Enter searches the typed text', async () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('re');
      press('ArrowDown');

      typeInto('redu');
      press('Enter');

      await waitFor(() => expect(currentParams().get('query')).toBe('redu'));
    });

    it('closes the suggestions with Escape and keeps the text', () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('re');

      press('Escape');

      expect(options()).toHaveLength(0);
      expect(searchBox()).toHaveValue('re');
      expect(searchBox()).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not search while typing other keys', () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('react');

      press('a');

      expect(currentParams().get('query')).toBeNull();
    });
  });

  describe('searching', () => {
    it.each([
      ['a multi-word query', 'Alice react', 'Alice react'],
      ['a multi-word author name', 'Kent Beck', 'Kent Beck'],
      ['surrounding whitespace', '  react  ', 'react'],
    ])('searches %s with Enter when no suggestion is highlighted', async (_case, typed, query) => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto(typed);

      press('Enter');

      await waitFor(() => expect(currentParams().get('query')).toBe(query));
    });

    it('closes the suggestions after searching', async () => {
      renderWithRouter(<SearchBox talks={talks} />);
      typeInto('rea');

      press('Enter');

      await waitFor(() => expect(options()).toHaveLength(0));
    });
  });

  describe('sync with the URL query', () => {
    // Simulates another part of the page changing the query (e.g. removing the search chip)
    function ClearQueryButton() {
      const [, setSearchParams] = useSearchParams();
      return <button onClick={() => setSearchParams('')}>clear query</button>;
    }

    it('shows the query from the URL when the page opens', () => {
      renderWithRouter(<SearchBox talks={talks} />, { params: 'query=tdd' });

      expect(searchBox()).toHaveValue('tdd');
    });

    it('clears the input when the query is removed from the URL elsewhere', () => {
      renderWithRouter(
        <>
          <SearchBox talks={talks} />
          <ClearQueryButton />
        </>,
        { params: 'query=tdd' }
      );

      fireEvent.click(screen.getByRole('button', { name: 'clear query' }));

      expect(searchBox()).toHaveValue('');
    });

    it('removes the query from the URL when an empty search is submitted', async () => {
      renderWithRouter(<SearchBox talks={talks} />, { params: 'query=tdd&hasNotes=true' });

      typeInto('');
      fireEvent.submit(screen.getByRole('search'));

      await waitFor(() => expect(currentParams().toString()).toBe('hasNotes=true'));
    });
  });
});
