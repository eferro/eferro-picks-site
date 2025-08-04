import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import {
  MockDataFactory,
  TestSetupHelper,
  MockComponentGenerator,
  RenderHelper
} from './testUtilities';

// Mock the useTalks hook before importing utilities
vi.mock('../../hooks/useTalks', () => ({
  useTalks: vi.fn()
}));

describe('Consolidated Test Utilities', () => {
  describe('MockDataFactory', () => {
    it('creates a default mock talk', () => {
      const talk = MockDataFactory.createTalk();
      
      expect(talk).toEqual({
        id: expect.any(String),
        title: expect.any(String),
        speakers: expect.any(Array),
        conference_name: expect.any(String),
        duration: expect.any(Number),
        topics: expect.any(Array),
        core_topic: expect.any(String),
        url: expect.any(String),
        description: expect.any(String),
        notes: undefined,
        format: 'talk',
        year: expect.any(Number)
      });
    });

    it('creates a mock talk with overrides', () => {
      const overrides = {
        id: 'custom-id',
        title: 'Custom Title',
        speakers: ['Custom Speaker']
      };
      
      const talk = MockDataFactory.createTalk(overrides);
      
      expect(talk.id).toBe('custom-id');
      expect(talk.title).toBe('Custom Title');
      expect(talk.speakers).toEqual(['Custom Speaker']);
    });

    it('creates multiple mock talks', () => {
      const talks = MockDataFactory.createTalks(3);
      
      expect(talks).toHaveLength(3);
      expect(talks[0].id).not.toBe(talks[1].id);
      expect(talks[1].id).not.toBe(talks[2].id);
    });

    it('creates mock talks with preset configurations', () => {
      const talkWithNotes = MockDataFactory.createTalkWithNotes();
      const talkWithoutNotes = MockDataFactory.createTalkWithoutNotes();
      const recentTalk = MockDataFactory.createRecentTalk();
      
      expect(talkWithNotes.notes).toBeDefined();
      expect(talkWithNotes.notes).not.toBe('');
      expect(talkWithoutNotes.notes).toBeUndefined();
      expect(recentTalk.year).toBeGreaterThanOrEqual(new Date().getFullYear() - 1);
    });

    it('creates talks for specific test scenarios', () => {
      const talksForFiltering = MockDataFactory.createTalksForFiltering();
      
      expect(talksForFiltering).toHaveLength(5);
      expect(talksForFiltering.some(t => t.topics.includes('react'))).toBe(true);
      expect(talksForFiltering.some(t => t.topics.includes('testing'))).toBe(true);
      expect(talksForFiltering.some(t => t.notes)).toBe(true);
      expect(talksForFiltering.some(t => !t.notes)).toBe(true);
    });
  });

  describe('TestSetupHelper', () => {
    it('sets up basic test environment', () => {
      const cleanup = TestSetupHelper.setupBasicTest();
      
      // Should return cleanup function
      expect(cleanup).toBeInstanceOf(Function);
      
      // Should setup window location
      expect(window.location.search).toBeDefined();
    });

    it('sets up talks test environment', () => {
      const mockTalks = [MockDataFactory.createTalk()];
      const cleanup = TestSetupHelper.setupTalksTest({ 
        talks: mockTalks, 
        loading: false 
      });
      
      // Should mock useTalks hook
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('sets up router test environment', () => {
      const cleanup = TestSetupHelper.setupRouterTest({
        initialPath: '/talks',
        searchParams: new URLSearchParams('author=test')
      });
      
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('sets up component-specific test environment', () => {
      const cleanup = TestSetupHelper.setupComponentTest('TalksList', {
        setupHandlers: true
      });
      
      expect(cleanup).toBeInstanceOf(Function);
    });
  });

  describe('MockComponentGenerator', () => {
    it('generates mock TalkCard component', () => {
      const MockTalkCard = MockComponentGenerator.createMockTalkCard();
      
      expect(MockTalkCard).toBeInstanceOf(Function);
      expect(MockTalkCard.name).toBe('MockTalkCard');
    });

    it('generates mock TalkSection component', () => {
      const MockTalkSection = MockComponentGenerator.createMockTalkSection();
      
      expect(MockTalkSection).toBeInstanceOf(Function);
      expect(MockTalkSection.name).toBe('MockTalkSection');
    });

    it('generates mock TalksList component', () => {
      const MockTalksList = MockComponentGenerator.createMockTalksList();
      
      expect(MockTalksList).toBeInstanceOf(Function);
      expect(MockTalksList.name).toBe('MockTalksList');
    });

    it('generates customizable mock components', () => {
      const MockTalkCard = MockComponentGenerator.createMockTalkCard({
        includeHandlers: true,
        includeTestIds: true,
        customBehavior: {
          onAuthorClick: vi.fn(),
          onTopicClick: vi.fn()
        }
      });
      
      expect(MockTalkCard).toBeInstanceOf(Function);
    });
  });

  describe('RenderHelper', () => {
    it('renders component with router context', () => {
      const TestComponent = createElement('div', {}, 'Test Component');
      const result = RenderHelper.renderWithTestRouter(
        TestComponent,
        { initialPath: '/test' }
      );
      
      expect(result.container).toBeDefined();
      expect(result.cleanup).toBeInstanceOf(Function);
    });
  });

  describe('Integration', () => {
    it('works together to setup and render test scenarios', () => {
      // Setup test environment
      const testCleanup = TestSetupHelper.setupComponentTest('TalksList');
      
      // Create test data
      const talks = MockDataFactory.createTalksForFiltering();
      const handlers = TestSetupHelper.createMockHandlers();
      
      // Verify utilities work together
      expect(talks).toHaveLength(5);
      expect(handlers.onAuthorClick).toBeInstanceOf(Function);
      expect(handlers.onTopicClick).toBeInstanceOf(Function);
      expect(testCleanup).toBeInstanceOf(Function);
      
      // Cleanup
      testCleanup();
    });
  });
});