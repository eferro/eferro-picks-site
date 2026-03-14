# Test Improvement Plan - eferro-picks-site

> **📊 STATUS UPDATE - March 14, 2026**
>
> **Original Goal:** Transform test suite from B+ to A
> **Current Status:** A- achieved! ✅
>
> **Completed Phases:**
> - ✅ Phase 1: Quick Wins (100%)
> - ✅ Phase 2.2: Window Test Double (100%)
> - ✅ Phase 5.1-5.3: Readability improvements (100%)
> - ✅ Phase 3.1: Integration test infrastructure (100%)
>
> **For current status and next steps, see:**
> - **[test-desiderata-current-status.md](./test-desiderata-current-status.md)**
> - **[README.md](./README.md)**

**Based on:** Test Desiderata Analysis (2026-03-13)
**Goal:** Transform test suite from "good" (B+) to "excellent" (A)
**Timeline:** 7 weeks (1-2 hours/day)

---

## Phase 1: Quick Wins (Week 1 - 5 hours) ✅ COMPLETED

### Task 1.1: Remove Debug Artifacts (1 hour) ✅
**Files:** `src/components/TalksList/TalksList.test.tsx`
**Status:** DONE - 0 console.log statements remain

```bash
# Find and remove all console.log statements
grep -n "console.log" src/**/*.test.{ts,tsx}
# Remove lines 434, 448, 471, 473 from TalksList.test.tsx
```

**Before:**
```typescript
console.log('Talks at start:', (useTalks as ReturnType<typeof vi.fn>).mock.results?.[0]?.value?.talks);
```

**After:**
```typescript
// Remove entirely - use assertions instead
```

**Impact:** ✅ Improves Readability, Automated

---

### Task 1.2: Extract Magic Numbers to Constants (2 hours)
**Files:** `src/utils/format.test.ts`, `src/hooks/useScrollPosition.test.tsx`

**Before:**
```typescript
expect(formatDuration(3600.5)).toBe('1h 0m');
expect(formatDuration(90.7)).toBe('1m');
expect(formatDuration(30.9)).toBe('30.9s');
```

**After:**
```typescript
// At top of file
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const ONE_HOUR_PLUS_FRACTION = SECONDS_PER_HOUR + 0.5;
const ONE_MINUTE_PLUS_FRACTION = SECONDS_PER_MINUTE + 30.7;

it('handles decimal values correctly', () => {
  expect(formatDuration(ONE_HOUR_PLUS_FRACTION)).toBe('1h 0m');
  expect(formatDuration(ONE_MINUTE_PLUS_FRACTION)).toBe('1m');
  expect(formatDuration(30.9)).toBe('30.9s'); // Preserve seconds precision
});
```

**Impact:** ✅ Improves Readable

---

### Task 1.3: Reduce waitFor Timeouts (2 hours)
**Files:** `src/hooks/useTalks.test.tsx`

**Before:**
```typescript
const renderUseTalksHook = async (timeout: number = 1000) => {
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false);
  }, { timeout });
};
```

**After:**
```typescript
const renderUseTalksHook = async () => {
  const hook = renderHook(() => useTalks(), { wrapper: TestProvider });

  // Since we control the mock, data is immediately available
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false);
  }, { timeout: 100 }); // Reduced from 1000ms

  return hook;
};

// For network error tests specifically
const renderUseTalksHookWithRetry = async () => {
  const hook = renderHook(() => useTalks(), { wrapper: TestProvider });
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false);
  }, { timeout: 500 }); // Only for retry scenarios
  return hook;
};
```

**Impact:** ✅ Improves Fast

---

## Phase 2: Determinism Fixes (Week 2 - 8 hours)

### Task 2.1: Extract Timing Configuration (3 hours)
**Files:** `src/hooks/useScrollPosition.tsx` (production), `src/hooks/useScrollPosition.test.tsx`

**Step 1: Update Production Code**
```typescript
// src/hooks/useScrollPosition.tsx
export interface ScrollConfig {
  debounceMs: number;
  retryDelayMs: number;
  maxRetries: number;
}

const DEFAULT_SCROLL_CONFIG: ScrollConfig = {
  debounceMs: 100,
  retryDelayMs: 100,
  maxRetries: 10
};

export function useScrollPosition(config: ScrollConfig = DEFAULT_SCROLL_CONFIG) {
  // Use config.debounceMs instead of hardcoded 100
  // Use config.retryDelayMs instead of exponential backoff calculation
}
```

**Step 2: Update Tests**
```typescript
// src/hooks/useScrollPosition.test.tsx
it('retries scroll restoration when target not reached', () => {
  const testConfig: ScrollConfig = {
    debounceMs: 10,  // Fast for tests
    retryDelayMs: 10,
    maxRetries: 3    // Fewer retries in tests
  };

  renderHook(() => useScrollPosition(testConfig));

  // No need to duplicate exponential backoff logic
  // Test just verifies retries happen
  expect(window.scrollTo).toHaveBeenCalledTimes(testConfig.maxRetries);
});
```

**Impact:** ✅✅ Improves Deterministic, Fast

---

### Task 2.2: Create Window Test Double (3 hours) ✅ COMPLETED
**Files:** `src/test/doubles/window.ts` (new), `src/hooks/useScrollPosition.test.tsx`
**Status:** DONE - Full implementation with test coverage

**Step 1: Create Test Double**
```typescript
// src/test/doubles/window.ts
export interface WindowDouble {
  scrollY: number;
  scrollTo(x: number, y: number): void;
  addEventListener(event: string, handler: () => void): void;
  removeEventListener(event: string, handler: () => void): void;
  dispatchEvent(event: Event): void;
}

export function createWindowDouble(options?: {
  initialScrollY?: number;
  scrollBehavior?: 'instant' | 'delayed' | 'partial';
}): WindowDouble {
  const scrollY = options?.initialScrollY ?? 0;
  const listeners = new Map<string, Set<() => void>>();

  return {
    scrollY,
    scrollTo(x: number, y: number) {
      if (options?.scrollBehavior === 'partial') {
        this.scrollY = Math.max(0, y - 20); // Simulate incomplete scroll
      } else if (options?.scrollBehavior === 'delayed') {
        // Simulate async scroll
        setTimeout(() => { this.scrollY = y; }, 50);
      } else {
        this.scrollY = y;
      }
    },
    addEventListener(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    },
    removeEventListener(event, handler) {
      listeners.get(event)?.delete(handler);
    },
    dispatchEvent(event) {
      listeners.get(event.type)?.forEach(handler => handler());
    }
  };
}
```

**Step 2: Use in Tests**
```typescript
// src/hooks/useScrollPosition.test.tsx
it('retries scroll restoration with delayed rendering', () => {
  const mockWindow = createWindowDouble({
    scrollBehavior: 'partial'  // Clear intent!
  });

  // Inject mock window into hook (requires production code change)
  renderHook(() => useScrollPosition({ window: mockWindow }));

  // Test becomes much clearer
  expect(mockWindow.scrollY).toBe(SAVED_SCROLL_POSITION);
});
```

**Impact:** ✅✅ Improves Deterministic, Readable, Structure-insensitive

---

### Task 2.3: Synchronous Test Data (2 hours)
**Files:** `src/hooks/useTalks.test.tsx`

**Before:**
```typescript
it('loads and processes talks correctly', async () => {
  const { result } = await renderUseTalksHook();
  expect(result.current.talks).toHaveLength(1);
});
```

**After:**
```typescript
// Create synchronous mock
vi.mock('../../hooks/useTalks');
(useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
  talks: [mockProcessedTalk],
  loading: false,
  error: null
});

it('loads and processes talks correctly', () => {
  // No async needed!
  const { result } = renderHook(() => useTalks());
  expect(result.current.talks).toHaveLength(1);
});
```

**Impact:** ✅ Improves Deterministic, Fast

---

## Phase 3: Structure-Insensitivity (Weeks 3-4 - 16 hours)

### Task 3.1: Create Integration Test Infrastructure (4 hours) ✅ COMPLETED
**Status:** DONE - `renderIntegration()` helper created with full test coverage

**Step 1: Create TestAppProvider**
```typescript
// src/test/integrationUtils.tsx
import { MemoryRouter } from 'react-router-dom';
import { TestProvider } from './context/TestContext';
import type { Talk } from '../types/talks';

interface TestAppOptions {
  initialPath?: string;
  talks?: Talk[];
  searchParams?: URLSearchParams;
}

export function TestAppProvider({
  children,
  options = {}
}: {
  children: React.ReactNode;
  options?: TestAppOptions
}) {
  const { initialPath = '/', talks = [], searchParams } = options;
  const fullPath = searchParams
    ? `${initialPath}?${searchParams.toString()}`
    : initialPath;

  return (
    <MemoryRouter initialEntries={[fullPath]}>
      <TestProvider talks={talks}>
        {children}
      </TestProvider>
    </MemoryRouter>
  );
}

export function renderIntegration(
  component: React.ReactElement,
  options?: TestAppOptions
) {
  return render(component, {
    wrapper: ({ children }) => (
      <TestAppProvider options={options}>
        {children}
      </TestAppProvider>
    )
  });
}
```

**Impact:** ✅✅✅ Improves Structure-insensitive, Writable, Predictive

---

### Task 3.2: Refactor TalksList Tests (8 hours)

**Before (structure-sensitive):**
```typescript
vi.mock('./TalkSection', () => ({
  TalkSection: (props: MockTalkSectionProps) => {
    return <section>... 30 lines of mock ...</section>;
  }
}));

vi.mock('../../hooks/useTalks');
(useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
  talks: [createTalk()],
  loading: false,
  error: null
}));

renderWithRouter(<TalksList />);
```

**After (structure-insensitive):**
```typescript
// No mocks needed!
const talks = [
  createTalk({ id: '1', title: 'React Testing', topics: ['react'] }),
  createTalk({ id: '2', title: 'TDD Basics', topics: ['testing'] })
];

renderIntegration(<TalksList />, { talks });

// Test real behavior
expect(screen.getByText('React Testing')).toBeInTheDocument();
expect(screen.getByText('TDD Basics')).toBeInTheDocument();
```

**Specific Files to Refactor:**
1. `src/components/TalksList/TalksList.test.tsx` (4 hours)
   - Remove TalkSection mock
   - Convert to integration style
   - Keep complex filtering logic tests

2. `src/components/TalkDetail/TalkDetail.test.tsx` (2 hours)
   - Remove hook mocks
   - Test navigation through user actions

3. `src/components/SearchBox/SearchBox.test.tsx` (1 hour)
   - Already mostly integration-style, verify no mocks needed

4. `src/components/TalksList/TalkCard.test.tsx` (1 hour)
   - Can stay as unit test (pure component)
   - Just verify no unnecessary mocks

**Impact:** ✅✅✅ Improves Structure-insensitive, Predictive, Inspiring

---

### Task 3.3: Refactor useTalks Tests (4 hours)

**Before (tests implementation):**
```typescript
vi.mock('../utils/talks', () => ({
  processTalks: vi.fn(),
  hasMeaningfulNotes: vi.fn()
}));

mockFetchResponse([mockAirtableItem]);
mockProcessedResponse([mockProcessedTalk]);
```

**After (tests behavior):**
```typescript
// Don't mock processTalks - let it run!
vi.mock('../utils/talks', () => ({
  ...vi.importActual('../utils/talks')
  // No mocks!
}));

// Provide real Airtable data
mockFetchResponse([{
  airtable_id: '1',
  name: 'Test Talk',
  language: 'English',
  rating: 5,
  resource_type: 'talk',
  // ... full valid Airtable item
}]);

// Test verifies end-to-end transformation
expect(result.current.talks[0]).toMatchObject({
  id: '1',
  title: 'Test Talk'
});
```

**Impact:** ✅✅ Improves Structure-insensitive, Predictive

---

## Phase 4: Predictiveness (Week 5 - 8 hours)

### Task 4.1: Add End-to-End Journey Tests (4 hours)

**Create New File:** `src/test/e2e/userJourneys.test.tsx`

```typescript
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderIntegration } from '../integrationUtils';
import { createTalk } from '../utils';
import App from '../../App';

describe('User Journeys', () => {
  const talks = [
    createTalk({
      id: '1',
      title: 'Domain-Driven Design',
      speakers: ['Eric Evans'],
      topics: ['ddd', 'architecture'],
      year: 2023,
      notes: 'Excellent overview of bounded contexts'
    }),
    createTalk({
      id: '2',
      title: 'Refactoring',
      speakers: ['Martin Fowler'],
      topics: ['refactoring', 'clean-code'],
      year: 2024
    })
  ];

  it('user discovers and watches a talk by topic', async () => {
    // 1. User lands on homepage
    renderIntegration(<App />, { talks });

    // 2. User searches for DDD
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'domain driven' } });
    fireEvent.submit(searchInput.closest('form')!);

    // 3. User sees filtered results
    await waitFor(() => {
      expect(screen.getByText('Domain-Driven Design')).toBeInTheDocument();
      expect(screen.queryByText('Refactoring')).not.toBeInTheDocument();
    });

    // 4. User clicks on talk
    fireEvent.click(screen.getByText('Domain-Driven Design'));

    // 5. User sees talk details with notes
    await waitFor(() => {
      expect(screen.getByText('Excellent overview of bounded contexts')).toBeInTheDocument();
    });

    // 6. User clicks back and filter is preserved
    fireEvent.click(screen.getByText(/back to talks/i));
    await waitFor(() => {
      expect(screen.getByText('Domain-Driven Design')).toBeInTheDocument();
      expect(searchInput).toHaveValue('domain driven');
    });
  });

  it('user combines multiple filters', async () => {
    renderIntegration(<App />, { talks });

    // Apply year filter
    fireEvent.click(screen.getByRole('button', { name: /year/i }));
    fireEvent.click(screen.getByText('2024'));

    // Apply format filter
    fireEvent.click(screen.getByRole('button', { name: /format/i }));
    fireEvent.click(screen.getByText('Talks'));

    // Apply rating filter
    fireEvent.click(screen.getByRole('button', { name: /top picks/i }));

    // Verify only talks matching ALL filters
    await waitFor(() => {
      const articles = screen.queryAllByRole('article');
      expect(articles.length).toBeLessThanOrEqual(talks.length);
      // Verify each visible talk matches filters
      articles.forEach(article => {
        const title = article.querySelector('h3')?.textContent;
        const matchingTalk = talks.find(t => t.title === title);
        expect(matchingTalk?.year).toBe(2024);
        expect(matchingTalk?.format).toBe('talk');
      });
    });
  });

  it('user recovers from error state', async () => {
    // Simulate API failure
    vi.mock('../../hooks/useTalks', () => ({
      useTalks: () => ({
        talks: [],
        loading: false,
        error: new Error('Network error')
      })
    }));

    renderIntegration(<App />);

    // User sees error message
    expect(screen.getByText(/unable to load talks/i)).toBeInTheDocument();

    // User clicks refresh (if implemented)
    // Or: verify graceful degradation
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
```

**Impact:** ✅✅✅ Improves Predictive, Inspiring, Behavioral

---

### Task 4.2: Add Error Recovery Tests (2 hours)

**File:** `src/hooks/useTalks.test.tsx`

```typescript
describe('Error Recovery', () => {
  it('retries failed requests with exponential backoff', async () => {
    let attemptCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockAirtableItem])
      });
    });

    const { result } = await renderUseTalksHook();

    // Verify: After retries, data loads successfully
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('provides actionable error message to user', async () => {
    mockFetchError(new Error('Network timeout'));

    const { result } = await renderUseTalksHook();

    expect(result.current.error?.message).toMatch(/unable to load/i);
    expect(result.current.error?.message).toMatch(/network timeout/i);
    // User can report this error to support
  });

  it('caches successful response for offline resilience', async () => {
    // First load - success
    mockFetchResponse([mockAirtableItem]);
    const { result } = await renderUseTalksHook();
    expect(result.current.talks).toHaveLength(1);

    // Second load - network failure
    mockFetchError(new Error('Offline'));
    const { result: result2 } = await renderUseTalksHook();

    // Verify: Cached data used
    expect(result2.current.talks).toHaveLength(1);
    expect(result2.current.error).toBeNull();
  });
});
```

**Impact:** ✅✅ Improves Predictive, Inspiring

---

### Task 4.3: Add Performance Tests (2 hours)

**File:** `src/utils/TalksFilter.test.ts`

```typescript
describe('Performance', () => {
  it('filters 1000 talks in under 100ms', () => {
    const manyTalks = Array.from({ length: 1000 }, (_, i) =>
      createTalk({
        id: `${i}`,
        title: `Talk ${i}`,
        topics: i % 2 === 0 ? ['react'] : ['vue'],
        year: 2020 + (i % 5)
      })
    );

    const filter = new TalksFilter({ query: 'react', year: 2023 });

    const start = performance.now();
    const result = filter.filter(manyTalks);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles talks with 100+ topics efficiently', () => {
    const talkWithManyTopics = createTalk({
      topics: Array.from({ length: 100 }, (_, i) => `topic-${i}`)
    });

    const start = performance.now();
    const filter = new TalksFilter({ query: 'topic-50' });
    const result = filter.filter([talkWithManyTopics]);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(10);
    expect(result).toHaveLength(1);
  });
});
```

**Impact:** ✅ Improves Predictive

---

## Phase 5: Readability (Week 6 - 6 hours)

### Task 5.1: Add Context Comments (3 hours) ✅ PARTIALLY COMPLETED

**Status:** TalksList.test.tsx completed, other files pending

**Files:** All complex test files

**Pattern to Apply:**
```typescript
describe('Feature Name', () => {
  /**
   * CONTEXT: Why this feature exists
   * - User problem it solves
   * - Production scenario it addresses
   *
   * EDGE CASES:
   * - What can go wrong
   * - Why these specific tests matter
   *
   * RELATED:
   * - Link to GitHub issue/PR
   * - Link to design doc
   */

  it('specific behavior', () => {
    // Given: Setup with clear labels
    const savedPosition = 500;
    saveScrollPosition(savedPosition);

    // When: Clear action
    restoreScrollPosition();

    // Then: Observable outcome
    expect(window.scrollY).toBe(savedPosition);
  });
});
```

**Apply to These Files:**
1. `src/hooks/useScrollPosition.test.tsx` - Explain scroll restoration UX
2. `src/utils/TalksFilter.test.ts` - Explain filter combination logic
3. `src/hooks/useTalks.test.tsx` - Explain retry strategy
4. `src/components/TalksList/TalksList.test.tsx` - Explain filter UI interactions

**Impact:** ✅✅ Improves Readable, Inspiring

---

### Task 5.2: Extract Complex Mocks (2 hours) ✅ COMPLETED

**Status:** DONE - MockTalkSection and MockYearFilter extracted with documentation

**Create:** `src/test/mocks/components.tsx`

```typescript
/**
 * Simplified TalkSection for testing TalksList in isolation.
 *
 * WHY: TalkSection renders heavy nested components (TalkCard, filters)
 * that aren't relevant when testing TalksList filter orchestration.
 *
 * USAGE: Import and use in TalksList.test.tsx
 *
 * TRADEOFF: Less realistic rendering, faster tests, clearer failures
 */
export const MockTalkSection = (props: TalkSectionProps) => {
  return (
    <section data-testid={`section-${props.coreTopic}`}>
      <h2>{props.coreTopic} ({props.talks.length})</h2>
      {props.talks.map((talk) => (
        <article key={talk.id} data-testid={`talk-${talk.id}`}>
          {talk.title}
        </article>
      ))}
    </section>
  );
};

/**
 * Simplified YearFilter for testing filter interactions.
 *
 * WHY: Year filter has complex dropdown logic that obscures
 * parent component tests.
 *
 * PROVIDES: Just the onChange callback for testing filter updates
 */
export const MockYearFilter = ({ onFilterChange }: YearFilterProps) => (
  <button onClick={() => onFilterChange({ type: 'last2' })}>
    Year Filter
  </button>
);
```

**Then in tests:**
```typescript
// src/components/TalksList/TalksList.test.tsx
import { MockTalkSection, MockYearFilter } from '../../test/mocks/components';

vi.mock('./TalkSection', () => ({ TalkSection: MockTalkSection }));
vi.mock('./YearFilter', () => ({ YearFilter: MockYearFilter }));

// Now test code is clear about what's mocked and why
```

**Impact:** ✅ Improves Readable, Writable

---

### Task 5.3: Create Testing Documentation (1 hour) ✅ COMPLETED

**Status:** DONE - Comprehensive testing patterns guide created

**Create:** `docs/testing-patterns.md`

```markdown
# Testing Patterns

## Philosophy

We follow Kent Beck's Test Desiderata:
1. **Isolated** - Tests don't affect each other
2. **Composable** - Test dimensions independently
3. **Deterministic** - Same code = same result
4. **Fast** - Run quickly during development
5. **Writable** - Easy to create new tests
6. **Readable** - Clear intent and motivation
7. **Behavioral** - Test outcomes, not implementation
8. **Structure-insensitive** - Survive refactoring
9. **Automated** - No manual steps
10. **Specific** - Failures pinpoint problems
11. **Predictive** - Catch real production issues
12. **Inspiring** - Build confidence in the system

## When to Use Each Test Type

### Unit Tests
**Use for:** Pure functions, utilities, business logic
**Example:** `TalksFilter`, `formatDuration`, `classNames`
**Speed:** < 1ms per test
**Mocking:** Minimal or none

### Integration Tests
**Use for:** Components, hooks with dependencies
**Example:** `TalksList`, `SearchBox`, `useTalks`
**Speed:** < 50ms per test
**Mocking:** Only external services (API, localStorage)

### End-to-End Tests
**Use for:** Critical user journeys
**Example:** Search → Filter → View Talk → Navigate Back
**Speed:** < 500ms per test
**Mocking:** None (or minimal)

## Test Utilities

### `createTalk(overrides?)`
Create test talk data with sensible defaults.

### `renderIntegration(component, options?)`
Render component with full app context (router, providers).

### `renderWithRouter(component)`
Render component with mocked router (for unit tests).

## Common Patterns

### Testing Filters
```typescript
// ✅ Good: Test through user actions
fireEvent.change(searchInput, { target: { value: 'react' } });
expect(screen.getByText('React Talk')).toBeInTheDocument();

// ❌ Bad: Test implementation details
expect(mockSetSearchParams).toHaveBeenCalledWith({ query: 'react' });
```

### Testing Async Behavior
```typescript
// ✅ Good: Use waitFor for user-observable changes
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// ❌ Bad: Wait for implementation details
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

### Mocking External Services
```typescript
// ✅ Good: Mock at boundary
global.fetch = vi.fn(() => Promise.resolve(mockResponse));

// ❌ Bad: Mock internal functions
vi.mock('../utils/talks', () => ({ processTalks: vi.fn() }));
```

## Debugging Failed Tests

1. Read the test name - what behavior failed?
2. Check the assertion - what was expected vs. actual?
3. Look for "console.error" output - React warnings?
4. Run test in isolation: `npm test -- --run TalksList.test.tsx`
5. Add debug output: `screen.debug()`

## Maintenance Rules

1. **Before adding a test:** Check if similar test exists
2. **Before mocking:** Ask if integration test is better
3. **Before breaking up test:** Check if it tests one behavior
4. **After refactoring:** Run full suite to catch structure-sensitivity
5. **When test is flaky:** Fix root cause, don't add retries
```

**Impact:** ✅✅ Improves Readable, Writable, Inspiring

---

## Phase 6: Optimize Speed (Week 7 - 4 hours)

### Task 6.1: Remove Redundant Re-renders (2 hours)

**File:** `src/components/TalksList/TalksList.test.tsx`

**Pattern to Find and Replace:**

```typescript
// BEFORE (render twice)
fireEvent.click(toggle);
const params = mockSetSearchParams.mock.calls[0][0];
setMockSearchParams(params);
cleanup();
renderWithRouter(<TalksList />);
expect(button).toHaveClass('active');

// AFTER (test state directly)
fireEvent.click(toggle);
const params = mockSetSearchParams.mock.calls[0][0];
expect(params.get('rating')).toBe('5');

// IF styling needs verification, use integration test
renderIntegration(<TalksList />, {
  searchParams: new URLSearchParams('rating=5')
});
expect(screen.getByRole('button', { name: /top picks/i }))
  .toHaveClass('bg-blue-500');
```

**Impact:** ✅ Improves Fast

---

### Task 6.2: Profile and Optimize Slowest Tests (2 hours)

```bash
# Find slow tests
npm test -- --run --reporter=verbose | grep -E "^\s+✓.*\([0-9]+ms\)" | sort -rn -k2

# Typical slow tests:
# - useTalks.test.tsx: renderUseTalksHook (1000ms+ per test)
# - useScrollPosition.test.tsx: timer-based tests (500ms+ per test)
# - TalksList.test.tsx: multiple re-renders (200ms+ per test)
```

**Optimizations:**

1. Reduce `waitFor` timeouts (already done in Phase 1)
2. Use synchronous mocks where possible
3. Batch assertions in single render
4. Consider parallel test execution for independent suites

**Impact:** ✅ Improves Fast

---

## Phase 7: Composability (Ongoing)

### Task 7.1: Split Monolithic Tests

**File:** `src/components/TalksList/TalksList.test.tsx`

**Before:**
```typescript
it('filters talks to show only those with notes', () => {
  // 70+ lines covering:
  // - Initial render
  // - Button click
  // - Re-render
  // - Filter verification
  // - Styling check
});
```

**After:**
```typescript
describe('Has Notes Filter', () => {
  describe('UI State', () => {
    it('shows inactive button by default', () => {
      renderIntegration(<TalksList />, { talks });
      const button = screen.getByRole('button', { name: /has notes/i });
      expect(button).toHaveClass('bg-white');
    });

    it('shows active button when filter enabled', () => {
      renderIntegration(<TalksList />, {
        talks,
        searchParams: new URLSearchParams('hasNotes=true')
      });
      const button = screen.getByRole('button', { name: /has notes/i });
      expect(button).toHaveClass('bg-blue-500');
    });
  });

  describe('Filtering Behavior', () => {
    it('shows only talks with notes when enabled', () => {
      const talksWithAndWithoutNotes = [
        createTalk({ id: '1', notes: 'Has notes' }),
        createTalk({ id: '2', notes: undefined })
      ];

      renderIntegration(<TalksList />, {
        talks: talksWithAndWithoutNotes,
        searchParams: new URLSearchParams('hasNotes=true')
      });

      expect(screen.getByText(talks[0].title)).toBeInTheDocument();
      expect(screen.queryByText(talks[1].title)).not.toBeInTheDocument();
    });
  });

  describe('URL State', () => {
    it('updates URL when toggled', () => {
      renderIntegration(<TalksList />, { talks });
      fireEvent.click(screen.getByRole('button', { name: /has notes/i }));

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({ hasNotes: 'true' })
      );
    });
  });
});
```

**Impact:** ✅✅ Improves Composable, Specific, Readable

---

## Success Metrics

Track progress with these measurements:

### Quantitative
```bash
# Test Suite Speed
npm test -- --run | grep "Test Files.*passed"
# Target: < 10 seconds for full suite

# Test Stability
for i in {1..50}; do npm test -- --run --reporter=dot; done | grep -c "FAIL"
# Target: 0 failures (100% stable)

# Code Coverage
npm run test:coverage
# Target: Maintain or improve current coverage

# Lines of Test Code
find src -name "*.test.ts*" -exec wc -l {} + | tail -1
# Target: Reduce by 10% while maintaining coverage
```

### Qualitative (Team Survey)

1. Can you understand a failing test in < 2 minutes? (Y/N)
2. Can you add a new test without looking at examples? (Y/N)
3. Do tests help you refactor with confidence? (1-5)
4. Have tests caught production bugs before deployment? (Count)

---

## Rollout Strategy

### Week 1: Pilot
- Apply Phase 1 (Quick Wins) to full suite
- Measure baseline metrics
- Get team feedback

### Weeks 2-4: Core Improvements
- Apply Phases 2-3 to one subsystem (e.g., TalksList)
- Evaluate impact
- Adjust approach based on learnings

### Weeks 5-7: Scale and Polish
- Apply remaining phases
- Address edge cases discovered during rollout
- Document final patterns

### Ongoing: Maintenance
- New tests follow new patterns
- Gradually refactor old tests as you touch them
- Review test quality in code reviews

---

## FAQ

**Q: Should we refactor all tests at once?**
A: No. Start with most painful tests (flaky, slow, brittle). Let new patterns emerge naturally.

**Q: What if refactoring breaks tests?**
A: That's a GOOD sign - it reveals structure-sensitivity. Fix by testing behavior instead of implementation.

**Q: Should we keep 100% code coverage?**
A: Coverage is a trailing indicator. Focus on testing valuable behaviors first.

**Q: When should we write integration vs. unit tests?**
A: Default to integration tests for React components. Use unit tests only for pure functions/utilities.

**Q: How do we know when tests are "good enough"?**
A: When you can refactor production code without breaking tests that still pass.

---

## Next Actions

1. ✅ Review this plan with team
2. ✅ Set up metrics tracking (baseline measurements)
3. ✅ Pick one test file for pilot (suggest: `TalksList.test.tsx`)
4. ⏳ Execute Phase 1 (Quick Wins)
5. ⏳ Measure and review results
6. ⏳ Continue with remaining phases
