import React, { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import type { Talk } from '../../types/talks';
import { useTalks } from '../../hooks/useTalks';

// =============================================================================
// MOCK DATA FACTORY
// =============================================================================

export class MockDataFactory {
  private static idCounter = 1;

  static createTalk(overrides: Partial<Talk> = {}): Talk {
    const id = `mock-talk-${this.idCounter++}`;
    
    return {
      id,
      title: `Mock Talk ${id}`,
      speakers: ['Mock Speaker'],
      conference_name: 'Mock Conference',
      duration: 3600,
      topics: ['mock-topic'],
      core_topic: 'Mock Core Topic',
      url: `https://example.com/talk/${id}`,
      description: `Mock description for ${id}`,
      notes: undefined,
      format: 'talk',
      year: 2024,
      ...overrides
    };
  }

  static createTalks(count: number, baseOverrides: Partial<Talk> = {}): Talk[] {
    return Array.from({ length: count }, (_, index) => 
      this.createTalk({
        ...baseOverrides,
        id: `mock-talk-${this.idCounter + index}`,
        title: `Mock Talk ${this.idCounter + index}`
      })
    );
  }

  static createTalkWithNotes(overrides: Partial<Talk> = {}): Talk {
    return this.createTalk({
      notes: 'These are some mock notes for testing purposes.',
      ...overrides
    });
  }

  static createTalkWithoutNotes(overrides: Partial<Talk> = {}): Talk {
    return this.createTalk({
      notes: undefined,
      ...overrides
    });
  }

  static createRecentTalk(overrides: Partial<Talk> = {}): Talk {
    const currentYear = new Date().getFullYear();
    return this.createTalk({
      year: currentYear,
      ...overrides
    });
  }

  static createTalksForFiltering(): Talk[] {
    return [
      this.createTalk({
        id: 'filter-test-1',
        title: 'React Testing Fundamentals',
        speakers: ['Alice Johnson'],
        topics: ['react', 'testing'],
        conference_name: 'ReactConf',
        notes: 'Great talk about testing React apps.',
        year: 2023
      }),
      this.createTalk({
        id: 'filter-test-2',
        title: 'Advanced TypeScript',
        speakers: ['Bob Smith'],
        topics: ['typescript', 'advanced'],
        conference_name: 'TSConf',
        notes: undefined,
        year: 2022
      }),
      this.createTalk({
        id: 'filter-test-3',
        title: 'Vue.js State Management',
        speakers: ['Carol Chen'],
        topics: ['vue', 'state-management'],
        conference_name: 'VueConf',
        notes: 'Comprehensive guide to Vuex and Pinia.',
        year: 2023
      }),
      this.createTalk({
        id: 'filter-test-4',
        title: 'Testing Strategies',
        speakers: ['David Wilson'],
        topics: ['testing', 'jest', 'vitest'],
        conference_name: 'TestingConf',
        notes: undefined,
        year: 2024
      }),
      this.createTalk({
        id: 'filter-test-5',
        title: 'React Performance',
        speakers: ['Eva Martinez'],
        topics: ['react', 'performance'],
        conference_name: 'ReactConf',
        notes: 'Deep dive into React performance optimization.',
        year: 2024
      })
    ];
  }

  static reset(): void {
    this.idCounter = 1;
  }
}

// =============================================================================
// TEST SETUP HELPER
// =============================================================================

export type TestSetupOptions = {
  clearMocks?: boolean;
  setupWindow?: boolean;
  setupRouter?: boolean;
};

export type TalksTestOptions = {
  talks?: Talk[];
  loading?: boolean;
  error?: string | null;
};

export type RouterTestOptions = {
  initialPath?: string;
  searchParams?: URLSearchParams;
};

export type ComponentTestOptions = {
  mockChildComponents?: boolean;
  setupHandlers?: boolean;
  customMocks?: Record<string, Mock>;
};

export class TestSetupHelper {
  static setupBasicTest(options: TestSetupOptions = {}): () => void {
    const { clearMocks = true, setupWindow = true } = options;
    
    if (clearMocks) {
      vi.clearAllMocks();
    }

    if (setupWindow) {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: ''
        },
        writable: true
      });
    }

    // Return cleanup function
    return () => {
      vi.restoreAllMocks();
    };
  }

  static setupTalksTest(options: TalksTestOptions = {}): () => void {
    const { talks = [], loading = false, error = null } = options;
    
    const mockUseTalks = vi.mocked(useTalks);
    mockUseTalks.mockReturnValue({
      talks,
      loading,
      error
    });

    this.setupBasicTest();

    return () => {
      mockUseTalks.mockRestore();
    };
  }

  static setupRouterTest(options: RouterTestOptions = {}): () => void {
    const { initialPath = '/', searchParams = new URLSearchParams() } = options;
    
    // Setup window location
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        pathname: initialPath,
        search: searchParams.toString()
      },
      writable: true
    });

    this.setupBasicTest();

    return () => {
      // Cleanup handled by setupBasicTest
    };
  }

  static setupComponentTest(
    componentName: string, 
    options: ComponentTestOptions = {}
  ): () => void {
    const { mockChildComponents = false, setupHandlers = false, customMocks = {} } = options;
    
    const cleanupFunctions: (() => void)[] = [];

    // Apply custom mocks
    Object.entries(customMocks).forEach(([key, mockFn]) => {
      vi.doMock(key, () => mockFn);
    });

    if (setupHandlers) {
      // Setup common handler mocks
      const handlers = this.createMockHandlers();
      cleanupFunctions.push(() => {
        Object.values(handlers).forEach(handler => handler.mockRestore());
      });
    }

    cleanupFunctions.push(this.setupBasicTest());

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }

  static createMockHandlers() {
    return {
      onAuthorClick: vi.fn(),
      onTopicClick: vi.fn(),
      onConferenceClick: vi.fn(),
      onRatingClick: vi.fn(),
      onFormatChange: vi.fn(),
      onHasNotesClick: vi.fn()
    };
  }
}

// =============================================================================
// MOCK COMPONENT GENERATOR
// =============================================================================

export type MockComponentOptions = {
  includeHandlers?: boolean;
  includeTestIds?: boolean;
  customBehavior?: Record<string, Mock>;
};

export class MockComponentGenerator {
  static createMockTalkCard(options: MockComponentOptions = {}) {
    const { includeHandlers = true, includeTestIds = true } = options;
    
    function MockTalkCard(props: any) {
      const { talk, onAuthorClick, onTopicClick, onConferenceClick } = props;
      
      return (
        <div data-testid={includeTestIds ? `talk-${talk.id}` : undefined}>
          <h3>{talk.title}</h3>
          {includeHandlers && (
            <>
              <button onClick={() => onAuthorClick?.(talk.speakers[0])}>
                Author: {talk.speakers[0]}
              </button>
              <button onClick={() => onTopicClick?.(talk.topics[0])}>
                Topic: {talk.topics[0]}
              </button>
              <button onClick={() => onConferenceClick?.(talk.conference_name)}>
                Conference: {talk.conference_name}
              </button>
            </>
          )}
        </div>
      );
    }
    
    return MockTalkCard;
  }

  static createMockTalkSection(options: MockComponentOptions = {}) {
    const { includeTestIds = true } = options;
    
    function MockTalkSection(props: any) {
      const { coreTopic, talks } = props;
      
      return (
        <section data-testid={includeTestIds ? 'talk-section' : undefined}>
          <h2>{coreTopic} ({talks.length})</h2>
          {talks.map((talk: Talk) => (
            <div key={talk.id} data-testid={`talk-${talk.id}`}>
              {talk.title}
            </div>
          ))}
        </section>
      );
    }
    
    return MockTalkSection;
  }

  static createMockTalksList(options: MockComponentOptions = {}) {
    const { includeTestIds = true } = options;
    
    function MockTalksList(props: any) {
      const { talks = [] } = props;
      
      return (
        <div data-testid={includeTestIds ? 'talks-list' : undefined}>
          <h1>Mock Talks List</h1>
          <div>Showing {talks.length} talks</div>
        </div>
      );
    }
    
    return MockTalksList;
  }
}

// =============================================================================
// RENDER HELPER
// =============================================================================

export type RenderWithCleanup = RenderResult & {
  cleanup: () => void;
};

export type TalksListRenderResult = RenderWithCleanup & {
  mockTalks: Talk[];
};

export type TalkDetailRenderResult = RenderWithCleanup & {
  mockTalk: Talk;
};

export type TalkCardRenderResult = RenderWithCleanup & {
  mockTalk: Talk;
  mockHandlers: ReturnType<typeof TestSetupHelper.createMockHandlers>;
};

export class RenderHelper {
  static renderTalksList(options: TalksTestOptions = {}): TalksListRenderResult {
    const { talks = MockDataFactory.createTalks(3), loading = false, error = null } = options;
    
    const cleanup = TestSetupHelper.setupTalksTest({ talks, loading, error });
    
    // Import TalksList dynamically to avoid circular dependencies
    const TalksList = require('../../components/TalksList').TalksList;
    
    const renderResult = render(<TalksList />, {
      wrapper: BrowserRouter
    });

    return {
      ...renderResult,
      mockTalks: talks,
      cleanup: () => {
        cleanup();
        renderResult.unmount();
      }
    };
  }

  static renderTalkDetail(talkId: string = 'test-id', options: Partial<Talk> = {}): TalkDetailRenderResult {
    const mockTalk = MockDataFactory.createTalk({ id: talkId, ...options });
    const cleanup = TestSetupHelper.setupTalksTest({ talks: [mockTalk] });
    
    // Mock useParams to return the talkId
    const mockUseParams = vi.fn(() => ({ id: talkId }));
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useParams: mockUseParams
      };
    });

    const TalkDetail = require('../../components/TalkDetail').TalkDetail;
    
    const renderResult = render(<TalkDetail />, {
      wrapper: BrowserRouter
    });

    return {
      ...renderResult,
      mockTalk,
      cleanup: () => {
        cleanup();
        mockUseParams.mockRestore();
        renderResult.unmount();
      }
    };
  }

  static renderTalkCard(
    talkOverrides: Partial<Talk> = {},
    handlerOverrides: Partial<ReturnType<typeof TestSetupHelper.createMockHandlers>> = {}
  ): TalkCardRenderResult {
    const mockTalk = MockDataFactory.createTalk(talkOverrides);
    const mockHandlers = {
      ...TestSetupHelper.createMockHandlers(),
      ...handlerOverrides
    };
    
    const cleanup = TestSetupHelper.setupBasicTest();

    const TalkCard = require('../../components/TalksList/TalkCard').TalkCard;
    
    const renderResult = render(
      <TalkCard
        talk={mockTalk}
        selectedAuthor={null}
        selectedTopics={[]}
        selectedConference={null}
        {...mockHandlers}
      />,
      { wrapper: BrowserRouter }
    );

    return {
      ...renderResult,
      mockTalk,
      mockHandlers,
      cleanup: () => {
        cleanup();
        renderResult.unmount();
      }
    };
  }

  static renderWithTestRouter(
    ui: ReactElement,
    options: { initialPath?: string } = {}
  ): RenderWithCleanup {
    const { initialPath = '/' } = options;
    
    const cleanup = TestSetupHelper.setupBasicTest();
    
    const renderResult = render(ui, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[initialPath]}>
          {children}
        </MemoryRouter>
      )
    });

    return {
      ...renderResult,
      cleanup: () => {
        cleanup();
        renderResult.unmount();
      }
    };
  }
}

// Classes are already exported above