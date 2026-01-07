import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all child components to isolate App testing
// These mocks must be defined before the App import
vi.mock('./components/TalksList', () => ({
  TalksList: () => <div data-testid="talks-list">Mocked TalksList</div>
}));
vi.mock('./components/TalkDetail', () => ({
  TalkDetail: () => <div data-testid="talk-detail">Mocked TalkDetail</div>
}));
vi.mock('./components/BackToTopButton', () => ({
  BackToTopButton: () => <div data-testid="back-to-top">Mocked BackToTopButton</div>
}));
vi.mock('./components/Footer', () => ({
  Footer: () => <div data-testid="footer">Mocked Footer</div>
}));

// Import App after mocks are set up
import App from './App';

describe('App layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('includes the BackToTopButton component', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    });
  });

  it('includes the Footer component', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('includes the TalksList on the home route', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('talks-list')).toBeInTheDocument();
    });
  });
});
