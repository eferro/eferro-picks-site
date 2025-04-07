import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, Mock } from 'vitest';
import { Talk } from '../types/talks';
import { TalkCard } from '../components/TalksList/TalkCard';

// Mock navigation
export const mockNavigate = vi.fn();

// Mock search params
export const mockSearchParams = {
  _params: new Map<string, string>(),
  get: vi.fn((key: string) => mockSearchParams._params.get(key) || null),
  toString: vi.fn(() => {
    const params = Array.from(mockSearchParams._params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return params ? `${params}` : '';
  }),
  set: vi.fn((key: string, value: string) => {
    mockSearchParams._params.set(key, value);
  }),
  delete: vi.fn((key: string) => {
    mockSearchParams._params.delete(key);
  }),
  entries: vi.fn(() => mockSearchParams._params.entries()),
  getAll: vi.fn((key: string) => {
    const value = mockSearchParams._params.get(key);
    return value ? [value] : [];
  }),
  has: vi.fn((key: string) => mockSearchParams._params.has(key)),
  keys: vi.fn(() => mockSearchParams._params.keys()),
  values: vi.fn(() => mockSearchParams._params.values()),
  forEach: vi.fn((callback: (value: string, key: string) => void) => {
    mockSearchParams._params.forEach((value, key) => callback(value, key));
  })
};

export const mockSetSearchParams = vi.fn();

// Setup router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: mockSearchParams.toString() }),
    useParams: () => ({}),
    Link: ({ children, to }: { children: React.ReactNode, to: any }) => {
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
  mockSearchParams._params.clear();

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      search: mockSearchParams.toString()
    },
    writable: true
  });

  mockSearchParams.get.mockImplementation((key: string) => mockSearchParams._params.get(key) || null);
  mockSearchParams.toString.mockImplementation(() => {
    const params = Array.from(mockSearchParams._params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return params ? `${params}` : '';
  });
  mockSearchParams.entries.mockImplementation(() => mockSearchParams._params.entries());
  mockSearchParams.has.mockImplementation((key: string) => mockSearchParams._params.has(key));
  mockSearchParams.getAll.mockImplementation((key: string) => {
    const value = mockSearchParams._params.get(key);
    return value ? [value] : [];
  });
  mockSearchParams.keys.mockImplementation(() => mockSearchParams._params.keys());
  mockSearchParams.values.mockImplementation(() => mockSearchParams._params.values());
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
  notes: undefined
};

// Mock handlers
export const mockHandlers = {
  onAuthorClick: vi.fn(),
  onTopicClick: vi.fn(),
  onConferenceClick: vi.fn()
};

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