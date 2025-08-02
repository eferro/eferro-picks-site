import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormatFilter } from './FormatFilter';
import { renderWithRouter } from '../../test/utils';

describe('FormatFilter', () => {
  it('renders dropdown button with default Format label', () => {
    renderWithRouter(
      <FormatFilter selectedFormats={[]} onChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
  });

  it('shows Format: Talks when only talk format is selected', () => {
    renderWithRouter(
      <FormatFilter selectedFormats={['talk']} onChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: /format: talks/i })).toBeInTheDocument();
  });

  it('shows Format: Podcasts when only podcast format is selected', () => {
    renderWithRouter(
      <FormatFilter selectedFormats={['podcast']} onChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: /format: podcasts/i })).toBeInTheDocument();
  });

  it('shows Formats (2) when both formats are selected', () => {
    renderWithRouter(
      <FormatFilter selectedFormats={['talk', 'podcast']} onChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: /formats \(2\)/i })).toBeInTheDocument();
  });

  it('opens dropdown menu on button click', () => {
    renderWithRouter(
      <FormatFilter selectedFormats={[]} onChange={() => {}} />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/any/i)).toBeInTheDocument();
    expect(screen.getByText(/talks/i)).toBeInTheDocument();
    expect(screen.getByText(/podcasts/i)).toBeInTheDocument();
  });

  it('selects talk format and calls onChange', () => {
    const onChange = vi.fn();
    renderWithRouter(
      <FormatFilter selectedFormats={[]} onChange={onChange} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const talkOption = screen.getByRole('menuitem', { name: /talks/i });
    fireEvent.click(talkOption);
    
    expect(onChange).toHaveBeenCalledWith(['talk']);
  });

  it('deselects talk format when already selected', () => {
    const onChange = vi.fn();
    renderWithRouter(
      <FormatFilter selectedFormats={['talk']} onChange={onChange} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const talkOption = screen.getByRole('menuitem', { name: /talks/i });
    fireEvent.click(talkOption);
    
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds podcast to existing talk selection', () => {
    const onChange = vi.fn();
    renderWithRouter(
      <FormatFilter selectedFormats={['talk']} onChange={onChange} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const podcastOption = screen.getByRole('menuitem', { name: /podcasts/i });
    fireEvent.click(podcastOption);
    
    expect(onChange).toHaveBeenCalledWith(['talk', 'podcast']);
  });

  it('clears all formats when selecting Any', () => {
    const onChange = vi.fn();
    renderWithRouter(
      <FormatFilter selectedFormats={['talk', 'podcast']} onChange={onChange} />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const anyOption = screen.getByRole('menuitem', { name: /any/i });
    fireEvent.click(anyOption);
    
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
