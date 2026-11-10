import { ReactElement } from 'react';
import { renderWithRouter } from '../router';

interface TestAppOptions {
  initialPath?: string;
  initialParams?: URLSearchParams;
  /**
   * When true, mounts the component under a catch-all route.
   * Prefer renderWithRouter(ui, { routePath: '/talk/:id' }) for useParams.
   */
  withRoutes?: boolean;
}

/**
 * Renders a component with a real in-memory router.
 * Thin adapter over renderWithRouter from src/test/router.tsx.
 */
export function renderIntegration(
  ui: ReactElement,
  { initialPath = '/', initialParams, withRoutes = false }: TestAppOptions = {}
) {
  return renderWithRouter(ui, {
    path: initialPath,
    params: initialParams,
    routePath: withRoutes ? '*' : undefined,
  });
}
