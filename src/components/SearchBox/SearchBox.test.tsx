import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter, mockSetSearchParams, createTalk } from '../../test/utils';
import { SearchBox } from './index';

const talks = [
  createTalk({ speakers: ['Alice'], topics: ['react'] }),
  createTalk({ speakers: ['Bob'], topics: ['javascript'] }),
];

describe('SearchBox', () => {
  it('suggests topics based on input', () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'topic:r' } });
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('updates url params on submit', async () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'author:Alice topic:react' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled());
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('author')).toBe('Alice');
    expect(params.get('topics')).toBe('react');
  });
});
