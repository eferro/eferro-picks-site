import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { renderWithRouter, currentLocation, currentParams } from './router';

function Probe() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div>
      <p>query: {searchParams.get('query') ?? 'none'}</p>
      <p>id: {id ?? 'none'}</p>
      <button onClick={() => setSearchParams('query=tdd')}>set query</button>
      <button onClick={() => navigate({ pathname: '/talk/7', search: 'a=1' })}>navigate</button>
      <Link to="/about">about</Link>
    </div>
  );
}

describe('renderWithRouter', () => {
  it('starts at the given path and params', () => {
    renderWithRouter(<Probe />, { path: '/talks', params: 'query=ddd' });

    expect(screen.getByText('query: ddd')).toBeInTheDocument();
    expect(currentLocation().pathname).toBe('/talks');
    expect(currentParams().get('query')).toBe('ddd');
  });

  it('accepts URLSearchParams as initial params', () => {
    renderWithRouter(<Probe />, { params: new URLSearchParams('query=xp') });

    expect(currentParams().get('query')).toBe('xp');
  });

  it('re-renders and tracks the URL when search params change', () => {
    renderWithRouter(<Probe />);

    fireEvent.click(screen.getByRole('button', { name: 'set query' }));

    expect(screen.getByText('query: tdd')).toBeInTheDocument();
    expect(currentLocation().search).toBe('?query=tdd');
  });

  it('tracks programmatic navigation', () => {
    renderWithRouter(<Probe />);

    fireEvent.click(screen.getByRole('button', { name: 'navigate' }));

    expect(currentLocation().pathname).toBe('/talk/7');
    expect(currentLocation().search).toBe('?a=1');
  });

  it('renders real links with their href', () => {
    renderWithRouter(<Probe />);

    expect(screen.getByRole('link', { name: 'about' })).toHaveAttribute('href', '/about');
  });

  it('provides route params when mounted under a route pattern', () => {
    renderWithRouter(<Probe />, { path: '/talk/42', routePath: '/talk/:id' });

    expect(screen.getByText('id: 42')).toBeInTheDocument();
  });
});
