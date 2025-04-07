import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach } from 'vitest';
import { Talk } from '../types/talks';
import { TalkCard } from '../components/TalksList/TalkCard';

// Mock navigation
export const mockNavigate = vi.fn();

// Mock search params
export const mockSearchParams = {
  get: vi.fn(),
  toString: vi.fn(),
  set: vi.fn()
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
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>
  };
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParams.get.mockImplementation(() => null);
  mockSearchParams.toString.mockImplementation(() => '');
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