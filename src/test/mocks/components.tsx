/**
 * CONTEXT: Reusable Component Mocks for Testing
 *
 * WHY: Complex component mocks duplicated across test files create:
 * - Maintenance burden (update in multiple places)
 * - Inconsistent behavior across tests
 * - Obscured test intent (20+ lines of mock before actual test)
 *
 * PRINCIPLE: Mock at the appropriate level
 * - Mock heavy/complex child components to isolate parent logic
 * - Keep mocks simple: render minimal necessary structure
 * - Document WHY each mock exists and WHAT it provides
 *
 * USAGE:
 * ```typescript
 * import { MockTalkSection } from '../../test/mocks/components';
 * vi.mock('./TalkSection', () => ({ TalkSection: MockTalkSection }));
 * ```
 */

import { mockNavigate, getMockSearchParams } from '../utils';

/**
 * MockTalkSection - Simplified TalkSection for testing TalksList in isolation
 *
 * WHY MOCK THIS:
 * Real TalkSection is complex:
 * - Renders multiple TalkCard components (each with many child elements)
 * - Handles click interactions, hover states, visual indicators
 * - Includes speaker/topic filtering buttons
 * - Heavy DOM structure slows tests and obscures failures
 *
 * WHEN TO USE:
 * - Testing TalksList filter orchestration (not TalkCard rendering)
 * - Testing URL parameter management
 * - Testing filter combinations and state
 *
 * WHEN NOT TO USE:
 * - Integration tests that need real TalkCard behavior
 * - Testing TalkSection itself (use real component)
 * - Testing visual appearance or interactions
 *
 * TRADEOFF:
 * - ✅ Faster tests (less DOM to render)
 * - ✅ Clearer failures (less noise in test output)
 * - ✅ Isolated testing (TalksList logic only)
 * - ❌ Less realistic rendering (integration issues may be missed)
 *
 * PROVIDES:
 * - Section with coreTopic heading
 * - Article elements for each talk (for counting/presence checks)
 * - Basic navigation on click
 * - Topics and speakers as spans (for presence checks)
 */
export interface MockTalkSectionProps {
  coreTopic: string;
  talks: Array<{
    id: string;
    title: string;
    topics?: string[];
    speakers?: string[];
  }>;
}

export const MockTalkSection = (props: MockTalkSectionProps) => {
  return (
    <section data-testid={`section-${props.coreTopic}`}>
      <h2>
        {props.coreTopic} ({props.talks.length})
      </h2>
      {props.talks.map((talk) => (
        <div key={talk.id} role="article" data-testid={`talk-${talk.id}`}>
          <div
            onClick={() =>
              mockNavigate({
                pathname: `/talk/${talk.id}`,
                search: getMockSearchParams().toString(),
              })
            }
          >
            {talk.title}
          </div>
          {/* Topics as spans (no click handlers) */}
          {(talk.topics || []).map((topic: string) => (
            <span
              key={`topic-${talk.id}-${topic}`}
              aria-label={`Topic: ${topic}`}
              data-testid={`topic-${topic}`}
            >
              {topic}
            </span>
          ))}
          {/* Speakers as spans (no click handlers) */}
          {(talk.speakers || []).map((speaker: string) => (
            <span
              key={`speaker-${talk.id}-${speaker}`}
              aria-label={`Speaker: ${speaker}`}
            >
              {speaker}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
};

/**
 * MockYearFilter - Simplified YearFilter for testing filter interactions
 *
 * WHY MOCK THIS:
 * Real YearFilter is complex:
 * - Dropdown menu with Headless UI
 * - Multiple filter type options (last2, last5, before, after, specific year)
 * - Complex keyboard navigation and accessibility
 * - Focus management and animations
 *
 * WHEN TO USE:
 * - Testing TalksList filter orchestration
 * - Testing that onFilterChange is called correctly
 * - Testing URL parameter updates
 *
 * WHEN NOT TO USE:
 * - Testing YearFilter itself (use real component)
 * - Integration tests requiring real dropdown behavior
 * - Testing accessibility or keyboard navigation
 *
 * TRADEOFF:
 * - ✅ Simple, predictable behavior
 * - ✅ Easy to trigger filter changes in tests
 * - ✅ No dropdown/menu complexity in test output
 * - ❌ Doesn't test real user interaction flow
 *
 * PROVIDES:
 * - Button that triggers onFilterChange with 'last2' type
 * - Enough to test parent component's filter handling
 */
export interface MockYearFilterProps {
  onFilterChange: (filter: { type: string }) => void;
}

export const MockYearFilter = ({ onFilterChange }: MockYearFilterProps) => (
  <button onClick={() => onFilterChange({ type: 'last2' })}>
    Year Filter
  </button>
);

/**
 * GUIDELINES FOR ADDING NEW MOCKS:
 *
 * Before adding a mock here, ask:
 * 1. Is this mock used in 2+ test files? (If not, keep it local)
 * 2. Is the real component too complex/slow for the tests? (If not, use real)
 * 3. Are we testing the parent's logic, not this component? (If not, use real)
 *
 * If adding a mock:
 * - Add comprehensive JSDoc explaining WHY it exists
 * - Document WHEN TO USE and WHEN NOT TO USE
 * - List TRADEOFFS clearly
 * - Keep it SIMPLE - only what's needed for tests
 * - Export TypeScript interfaces for type safety
 */
