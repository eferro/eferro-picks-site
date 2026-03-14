/* eslint-disable react-refresh/only-export-components */
import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

interface TestAppOptions {
  initialPath?: string;
  initialParams?: URLSearchParams;
  /**
   * When true, wraps component in Routes with catchall route.
   * Required for components that use useParams.
   * Default: false
   */
  withRoutes?: boolean;
}

/**
 * Integration test provider that wraps components with MemoryRouter.
 *
 * Unlike BrowserRouter, MemoryRouter supports programmatic navigation
 * and is ideal for testing navigation flows and URL parameter handling.
 *
 * @param withRoutes - When true, wraps in <Routes> for components using useParams
 *
 * @example
 * ```typescript
 * // For components WITHOUT route parameters
 * <TestAppProvider initialPath="/talks" initialParams={new URLSearchParams('rating=5')}>
 *   <TalksList />
 * </TestAppProvider>
 *
 * // For components WITH route parameters (e.g., /talk/:id)
 * <TestAppProvider initialPath="/talk/123" withRoutes>
 *   <TalkDetail />
 * </TestAppProvider>
 * ```
 */
export function TestAppProvider({
  children,
  initialPath = '/',
  initialParams = new URLSearchParams(),
  withRoutes = false,
}: TestAppOptions & { children: ReactNode }) {
  const fullPath = initialParams.toString()
    ? `${initialPath}?${initialParams.toString()}`
    : initialPath;

  const content = withRoutes ? (
    <Routes>
      <Route path="*" element={children} />
    </Routes>
  ) : children;

  return (
    <MemoryRouter initialEntries={[fullPath]}>
      {content}
    </MemoryRouter>
  );
}

/**
 * Renders a component in integration test mode with real routing.
 *
 * Key differences from renderWithRouter:
 * - Uses MemoryRouter (supports programmatic navigation)
 * - No mock implementations of react-router-dom hooks
 * - Real child components render (no mocking needed)
 * - Ideal for testing user workflows and filter interactions
 *
 * @param options.withRoutes - Set to true for components using useParams (e.g., TalkDetail)
 *
 * @example
 * ```typescript
 * // For components WITHOUT route parameters
 * renderIntegration(<TalksList />, {
 *   initialPath: '/talks',
 *   initialParams: new URLSearchParams('rating=5&hasNotes=true')
 * });
 *
 * // For components WITH route parameters
 * renderIntegration(<TalkDetail />, {
 *   initialPath: '/talk/123',
 *   withRoutes: true
 * });
 *
 * // User interactions work naturally
 * fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
 *
 * // Verify user-visible outcomes
 * expect(screen.getByText('All talks')).toBeInTheDocument();
 * ```
 */
export function renderIntegration(
  ui: ReactElement,
  options: TestAppOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestAppProvider {...options}>
        {children}
      </TestAppProvider>
    )
  });
}
