import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { renderIntegration } from './IntegrationTestHelpers';

// Test component that displays current URL state
function TestComponent() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  return (
    <div>
      <div data-testid="pathname">{location.pathname}</div>
      <div data-testid="search">{location.search}</div>
      <div data-testid="rating-param">{searchParams.get('rating') || 'none'}</div>
      <div data-testid="has-notes-param">{searchParams.get('hasNotes') || 'none'}</div>
    </div>
  );
}

describe('IntegrationTestHelpers', () => {
  describe('renderIntegration', () => {
    it('renders component with default path', () => {
      renderIntegration(<TestComponent />);

      expect(screen.getByTestId('pathname')).toHaveTextContent('/');
      expect(screen.getByTestId('search')).toHaveTextContent('');
    });

    it('renders component with custom initial path', () => {
      renderIntegration(<TestComponent />, {
        initialPath: '/talks'
      });

      expect(screen.getByTestId('pathname')).toHaveTextContent('/talks');
    });

    it('renders component with URL parameters', () => {
      const initialParams = new URLSearchParams('rating=5&hasNotes=true');

      renderIntegration(<TestComponent />, {
        initialPath: '/talks',
        initialParams
      });

      expect(screen.getByTestId('pathname')).toHaveTextContent('/talks');
      expect(screen.getByTestId('search')).toHaveTextContent('?rating=5&hasNotes=true');
      expect(screen.getByTestId('rating-param')).toHaveTextContent('5');
      expect(screen.getByTestId('has-notes-param')).toHaveTextContent('true');
    });

    it('handles empty URLSearchParams', () => {
      renderIntegration(<TestComponent />, {
        initialPath: '/talks',
        initialParams: new URLSearchParams()
      });

      expect(screen.getByTestId('pathname')).toHaveTextContent('/talks');
      expect(screen.getByTestId('search')).toHaveTextContent('');
      expect(screen.getByTestId('rating-param')).toHaveTextContent('none');
    });

    it('uses real react-router-dom hooks without mocking', () => {
      // This test verifies that we're not using mocked hooks
      // by checking that useSearchParams and useLocation return real values
      const initialParams = new URLSearchParams('author=John+Doe&year=2024');

      renderIntegration(<TestComponent />, {
        initialPath: '/search',
        initialParams
      });

      // Verify real routing hooks work
      expect(screen.getByTestId('pathname')).toHaveTextContent('/search');
      const searchText = screen.getByTestId('search').textContent || '';
      expect(searchText).toContain('author=John+Doe');
      expect(searchText).toContain('year=2024');
    });
  });
});
