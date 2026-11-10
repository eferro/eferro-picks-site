/* eslint-disable react-refresh/only-export-components */
import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, type Location } from 'react-router-dom';

export interface RouterOptions {
  /** Initial pathname, e.g. '/talk/42'. Default: '/' */
  path?: string;
  /** Initial query string, e.g. 'topics=react' or a URLSearchParams */
  params?: string | URLSearchParams;
  /**
   * Route pattern to mount the component under, e.g. '/talk/:id'.
   * Needed for components that read useParams().
   */
  routePath?: string;
}

let lastLocation: Location | null = null;

function LocationSpy() {
  lastLocation = useLocation();
  return null;
}

/**
 * Wrapper that provides a real in-memory router (no mocked hooks).
 * Use directly with renderHook; components use renderWithRouter.
 */
export function routerWrapper({ path = '/', params = '', routePath }: RouterOptions = {}) {
  const search = params.toString();
  const initialEntry = search ? `${path}?${search}` : path;
  lastLocation = null;

  return function RouterWrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <LocationSpy />
        {routePath ? (
          <Routes>
            <Route path={routePath} element={children} />
            <Route path="*" element={null} />
          </Routes>
        ) : children}
      </MemoryRouter>
    );
  };
}

/**
 * Renders a component inside a real in-memory router (no mocked hooks).
 * Navigation and setSearchParams update the router state, so components
 * re-render exactly as in the browser. Inspect the resulting URL with
 * currentLocation() / currentParams().
 */
export function renderWithRouter(ui: ReactElement, options: RouterOptions = {}) {
  return render(ui, { wrapper: routerWrapper(options) });
}

/** The router location after the latest render (pathname, search, ...). */
export function currentLocation(): Location {
  if (!lastLocation) {
    throw new Error('currentLocation() called before renderWithRouter()');
  }
  return lastLocation;
}

/** The query string of the current router location, parsed. */
export function currentParams(): URLSearchParams {
  return new URLSearchParams(currentLocation().search);
}
