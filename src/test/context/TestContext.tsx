import { createContext, useContext, ReactNode } from 'react';
import { vi } from 'vitest';
import { Talk } from '../../types/talks';

// Types for mock handlers
type MockHandlers = {
  onTopicClick: (topic: string) => void;
  onAuthorClick: (author: string) => void;
  onConferenceClick: (conference: string) => void;
};

// Default mock handlers
const defaultMockHandlers: MockHandlers = {
  onTopicClick: vi.fn(),
  onAuthorClick: vi.fn(),
  onConferenceClick: vi.fn(),
};

// Context type
type TestContextType = {
  mockHandlers: MockHandlers;
  mockTalk: Talk;
};

// Create context
const TestContext = createContext<TestContextType | null>(null);

// Default mock talk
const defaultMockTalk: Talk = {
  id: '1',
  title: 'Test Talk',
  speakers: ['Test Speaker'],
  url: 'https://example.com',
  conference_name: 'Test Conference',
  year: 2024,
  topics: ['test'],
  core_topic: 'test',
  duration: 1800, // 30 minutes in seconds
  description: 'A test talk description',
};

// Provider component
export function TestProvider({ 
  children,
  mockHandlers = defaultMockHandlers,
  mockTalk = defaultMockTalk,
}: {
  children: ReactNode;
  mockHandlers?: MockHandlers;
  mockTalk?: Talk;
}) {
  return (
    <TestContext.Provider value={{ mockHandlers, mockTalk }}>
      {children}
    </TestContext.Provider>
  );
}

// Custom hook for using the context
// eslint-disable-next-line react-refresh/only-export-components
export function useTestContext() {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return context;
} 