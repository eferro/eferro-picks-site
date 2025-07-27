import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopicsFilter } from './TopicsFilter';
import { createTalk, renderWithRouter } from '../../test/utils';

const openMenu = () => {
  const button = screen.getByRole('button');
  fireEvent.click(button);
};

describe('TopicsFilter', () => {
  it('renders unique topics in alphabetical order', () => {
    const talks = [
      createTalk({ topics: ['b'] }),
      createTalk({ topics: ['a', 'c'] }),
    ];

    renderWithRouter(
      <TopicsFilter talks={talks} selectedTopics={[]} onChange={() => {}} />
    );

    openMenu();

    const items = screen.getAllByRole('menuitem');
    const topics = items.map(btn => btn.textContent);
    expect(topics).toEqual(['a', 'b', 'c']);
  });

  it('calls onChange with updated topics', () => {
    const talks = [createTalk({ topics: ['react'] })];
    const onChange = vi.fn();
    renderWithRouter(
      <TopicsFilter talks={talks} selectedTopics={[]} onChange={onChange} />
    );
    openMenu();
    fireEvent.click(screen.getByText('react'));
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('shows count of selected topics', () => {
    const talks = [createTalk({ topics: ['a'] })];
    renderWithRouter(
      <TopicsFilter talks={talks} selectedTopics={['a', 'b']} onChange={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Topics (2)');
  });

  it('toggles off a selected topic', () => {
    const talks = [createTalk({ topics: ['react'] })];
    const onChange = vi.fn();
    renderWithRouter(
      <TopicsFilter talks={talks} selectedTopics={['react']} onChange={onChange} />
    );
    openMenu();
    fireEvent.click(screen.getByText('react'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('clears all topics when clicking Clear All', () => {
    const talks = [createTalk({ topics: ['a', 'b'] })];
    const onChange = vi.fn();
    renderWithRouter(
      <TopicsFilter talks={talks} selectedTopics={['a', 'b']} onChange={onChange} />
    );
    openMenu();
    fireEvent.click(screen.getByText('Clear All'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
