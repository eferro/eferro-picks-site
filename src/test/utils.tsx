import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { Talk } from '../types/talks';
import { TalkCard } from '../components/TalksList/TalkCard';

// Wrapper component to provide router context
export const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

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