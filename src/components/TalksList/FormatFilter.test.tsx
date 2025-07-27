import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormatFilter } from './FormatFilter';
import { renderWithRouter } from '../../test/utils';

describe('FormatFilter', () => {
  it('renders checkboxes for talks and podcasts', () => {
    renderWithRouter(
      <FormatFilter selectedFormats={[]} onChange={() => {}} />
    );
    expect(screen.getByLabelText(/talks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/podcasts/i)).toBeInTheDocument();
  });

  it('toggles formats and calls onChange', () => {
    const onChange = vi.fn();
    renderWithRouter(
      <FormatFilter selectedFormats={['talk']} onChange={onChange} />
    );
    const podcasts = screen.getByLabelText(/podcasts/i);
    fireEvent.click(podcasts);
    expect(onChange).toHaveBeenCalledWith(['talk', 'podcast']);
  });
});
