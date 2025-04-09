import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TestProvider, useTestContext } from './TestContext';

// Test component that uses the context
function TestComponent() {
  const { mockHandlers, mockTalk } = useTestContext();
  
  return (
    <div>
      <button onClick={() => mockHandlers.onTopicClick('test')}>Click Topic</button>
      <button onClick={() => mockHandlers.onAuthorClick('test')}>Click Author</button>
      <button onClick={() => mockHandlers.onConferenceClick('test')}>Click Conference</button>
      <div data-testid="talk-title">{mockTalk.title}</div>
    </div>
  );
}

describe('TestContext', () => {
  it('should provide default mock handlers and talk', () => {
    render(
      <TestProvider>
        <TestComponent />
      </TestProvider>
    );

    // Check that the talk title is rendered
    expect(screen.getByTestId('talk-title')).toHaveTextContent('Test Talk');
  });

  it('should allow custom mock handlers', () => {
    const customHandlers = {
      onTopicClick: vi.fn(),
      onAuthorClick: vi.fn(),
      onConferenceClick: vi.fn(),
    };

    render(
      <TestProvider mockHandlers={customHandlers}>
        <TestComponent />
      </TestProvider>
    );

    // Click the buttons
    screen.getByText('Click Topic').click();
    screen.getByText('Click Author').click();
    screen.getByText('Click Conference').click();

    // Check that the custom handlers were called
    expect(customHandlers.onTopicClick).toHaveBeenCalledWith('test');
    expect(customHandlers.onAuthorClick).toHaveBeenCalledWith('test');
    expect(customHandlers.onConferenceClick).toHaveBeenCalledWith('test');
  });

  it('should allow custom mock talk', () => {
    const customTalk = {
      id: '2',
      title: 'Custom Talk',
      speakers: ['Custom Speaker'],
      url: 'https://custom.com',
      conference_name: 'Custom Conference',
      year: 2023,
      topics: ['custom'],
      core_topic: 'custom',
      duration: 3600,
      description: 'A custom talk description',
    };

    render(
      <TestProvider mockTalk={customTalk}>
        <TestComponent />
      </TestProvider>
    );

    // Check that the custom talk title is rendered
    expect(screen.getByTestId('talk-title')).toHaveTextContent('Custom Talk');
  });
}); 