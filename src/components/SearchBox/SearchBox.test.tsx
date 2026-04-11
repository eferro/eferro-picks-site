import { screen, fireEvent, waitFor } from '@testing-library/react';
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
    fireEvent.change(input, { target: { value: 'r' } });
    expect(screen.getByText(/react/)).toBeInTheDocument();
  });

  it('updates url params on submit', async () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Alice react' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled());
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('query')).toBe('Alice react');
  });

  it('handles multi-word author names correctly', async () => {
    const talksWithMultiWordNames = [
      createTalk({ id: '1', title: 'Test Talk', speakers: ['Kent Beck'] })
    ];
    renderWithRouter(<SearchBox talks={talksWithMultiWordNames} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Kent Beck' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled());
    const params = mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1][0] as URLSearchParams;

    expect(params.get('query')).toBe('Kent Beck');
  });

  it('shows no suggestions for empty input', () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByRole('button', { name: /react/i })).not.toBeInTheDocument();
  });

  it('trims whitespace on submit', async () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  react  ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled());
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('query')).toBe('react');
  });

  it('shows no suggestions when input does not match any talk data', () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'xyznonexistent' } });
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('replaces last word with suggestion when clicked', () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello rea' } });

    const suggestion = screen.getByRole('button', { name: /react/ });
    fireEvent.click(suggestion);

    expect((input as HTMLInputElement).value).toBe('hello react');
  });

  it('clears suggestions after clicking a suggestion', () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'rea' } });
    expect(screen.getByRole('button', { name: /react/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /react/ }));
    expect(screen.queryByRole('button', { name: /react/ })).not.toBeInTheDocument();
  });

  it('clears suggestions after form submit', async () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'rea' } });
    expect(screen.getByRole('button', { name: /react/ })).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /react/ })).not.toBeInTheDocument();
    });
  });

  it('displays speaker and topic icons in suggestions', () => {
    renderWithRouter(<SearchBox talks={talks} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ali' } });

    const suggestion = screen.getByRole('button', { name: /Alice/ });
    expect(suggestion.textContent).toContain('👤');
  });

  it('has an accessible search placeholder', () => {
    renderWithRouter(<SearchBox talks={talks} />);
    expect(screen.getByPlaceholderText(/search in titles/i)).toBeInTheDocument();
  });
});
