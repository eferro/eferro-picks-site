/* eslint-disable react-refresh/only-export-components */
import { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

interface TestAppOptions {
  initialPath?: string;
  initialParams?: URLSearchParams;
}

/**
 * Integration test provider that wraps components with MemoryRouter.
 *
 * Unlike BrowserRouter, MemoryRouter supports programmatic navigation
 * and is ideal for testing navigation flows and URL parameter handling.
 *
 * @example
 * ```typescript
 * <TestAppProvider initialPath="/talks" initialParams={new URLSearchParams('rating=5')}>
 *   <TalksList />
 * </TestAppProvider>
 * ```
 */
export function TestAppProvider({
  children,
  initialPath = '/',
  initialParams = new URLSearchParams(),
}: TestAppOptions & { children: ReactNode }) {
  const fullPath = initialParams.toString()
    ? `${initialPath}?${initialParams.toString()}`
    : initialPath;

  return (
    <MemoryRouter initialEntries={[fullPath]}>
      {children}
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
 * @example
 * ```typescript
 * renderIntegration(<TalksList />, {
 *   initialPath: '/talks',
 *   initialParams: new URLSearchParams('rating=5&hasNotes=true')
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
