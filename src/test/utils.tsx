import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, Mock } from 'vitest';
import { Talk } from '../types/talks';
import { TalkCard } from '../components/TalksList/TalkCard';

// Mock navigation
export const mockNavigate = vi.fn();

// Mock search params
let _mockSearchParams = new URLSearchParams();
export function getMockSearchParams() {
  return _mockSearchParams;
}
export const setMockSearchParams = (params: URLSearchParams) => {
  _mockSearchParams = new URLSearchParams(params.toString());
};
// No need to export _mockSearchParams directly; use getMockSearchParams()

export const mockSetSearchParams = vi.fn();

// Setup router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [getMockSearchParams(), mockSetSearchParams],
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: getMockSearchParams().toString() }),
    useParams: () => ({}),
    Link: ({ children, to }: { children: React.ReactNode, to: string | { pathname?: string; search?: string } }) => {
      const search = typeof to === 'string' ? '' : to.search;
      const pathname = typeof to === 'string' ? to : to.pathname;
      const href = search ? `${pathname}?${search}` : pathname;
      return <a href={href} data-testid="link">{children}</a>;
    }
  };
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  // mockSearchParams = new URLSearchParams(); // This line is removed as per the edit hint

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      search: getMockSearchParams().toString()
    },
    writable: true
  });
});

// Mock data for testing
export const mockTalk: Talk = {
  id: '1',
  title: 'Test Talk',
  speakers: ['Test Speaker'],
  conference_name: 'Test Conference',
  duration: 3600, // 1 hour in seconds
  topics: ['test'],
  core_topic: 'test',
  url: 'https://example.com',
  description: 'Test description',
  notes: undefined,
  format: 'talk'
};

// Types for mock handlers
type MockHandlers = {
  onAuthorClick: Mock;
  onTopicClick: Mock;
  onConferenceClick: Mock;
};

// Mock handlers
export const createMockHandlers = (overrides: Partial<MockHandlers> = {}): MockHandlers => {
  const handlers = {
    onAuthorClick: vi.fn(),
    onTopicClick: vi.fn(),
    onConferenceClick: vi.fn(),
    ...overrides
  };
  return handlers;
};

// For backward compatibility
export const mockHandlers = createMockHandlers();

// Helper to create a talk with overrides
export const createTalk = (overrides: Partial<Talk> = {}): Talk => ({
  ...mockTalk,
  ...overrides
});

// Helper to render a TalkCard with default props
export const renderTalkCard = (props: Partial<React.ComponentProps<typeof TalkCard>> = {}) => {
  const defaultProps = {
    talk: mockTalk,
    ...mockHandlers,
    selectedAuthor: null,
    selectedTopics: [],
    selectedConference: null
  };

  const finalProps = { ...defaultProps, ...props };
  const result = renderWithRouter(
    <TalkCard {...finalProps} />
  );

  return {
    ...result,
    onTopicClick: finalProps.onTopicClick,
    onAuthorClick: finalProps.onAuthorClick,
    onConferenceClick: finalProps.onConferenceClick
  };
};

// Wrapper component to provide router context
export const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
}; 