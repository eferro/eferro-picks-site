# Test Desiderata Analysis - eferro-picks-site

> **⚠️ ARCHIVED - March 13, 2026**
>
> This is the **original baseline analysis**. For current status, see:
> - **[test-desiderata-current-status.md](./test-desiderata-current-status.md)** - Current status (A- grade)
> - **[README.md](./README.md)** - Quick navigation guide

**Analysis Date:** 2026-03-13 (Baseline)
**Total Test Files Analyzed:** 33 files
**Framework:** Kent Beck's Test Desiderata
**Original Grade:** B+ (Strong foundation, room for excellence)

---

## Executive Summary

Your test suite demonstrates **strong fundamentals** with excellent coverage and systematic organization. The tests are generally well-structured, use TDD principles, and have good isolation. However, there are specific areas where Test Desiderata principles can significantly improve test quality, particularly in:

1. **Structure-Insensitivity** - Heavy mocking couples tests to implementation details
2. **Determinism** - Time-dependent tests and global state management
3. **Fast** - Complex setup and redundant re-renders slow execution
4. **Readable** - Some tests obscure intent with excessive setup

**Overall Grade:** B+ (Strong foundation, room for excellence)

---

## Detailed Analysis by Test Desiderata Property

### 1. ✅ **Isolated** (STRONG - Grade: A-)

**Strengths:**
- Excellent `beforeEach` cleanup across all test files
- Each test resets mocks: `vi.clearAllMocks()`
- URL params reset: `setMockSearchParams(new URLSearchParams())`
- No test execution order dependencies

**Examples of Good Isolation:**
```typescript
// src/hooks/useFilterHandlers.test.tsx:13-14
beforeEach(() => {
  vi.clearAllMocks();
});
```

**Minor Issues:**
- `useScrollPosition.test.tsx:38-40` - Mock storage persists across tests via closure
- `useTalks.test.tsx:100-105` - Global fetch restoration in afterEach (good, but shows coupling)

**Recommendations:**
- ✅ Keep current isolation patterns
- Consider extracting `mockStorage` creation to factory function for each test
- Document isolation patterns in test utilities

---

### 2. ⚠️ **Composable** (MODERATE - Grade: B-)

**Strengths:**
- `createTalk` factory enables composition
- `renderWithRouter` wraps common rendering needs
- Test helpers in `test/utils.tsx` promote reuse

**Issues:**
```typescript
// Anti-pattern: Monolithic tests covering multiple concerns
// src/components/TalksList/TalksList.test.tsx:405-478
it('filters talks to show only those with notes', () => {
  // 70+ lines testing:
  // - Initial render
  // - Filter button click
  // - Re-render
  // - State verification
  // - Styling checks
  // Should be 4 separate tests
});
```

**Breakdown:**
- Tests often combine rendering + interaction + assertion
- Cannot test styling independently from filtering behavior
- `TalkDetail.test.tsx` mixes conference filtering with rendering

**Recommendations:**
1. **Split complex tests** into focused dimensions:
   ```typescript
   // BEFORE (monolithic)
   it('filters talks to show only those with notes', () => { ... })

   // AFTER (composable)
   describe('Has Notes Filter', () => {
     it('shows button with correct initial state', () => { ... })
     it('updates URL params when clicked', () => { ... })
     it('filters talks based on notes presence', () => { ... })
     it('applies active styling when enabled', () => { ... })
   })
   ```

2. **Extract test scenarios** into reusable builders:
   ```typescript
   const withNotesFilter = (active: boolean) => ({ hasNotes: active })
   const withYearFilter = (type: string, year: number | null) => ({ yearType: type, year })
   ```

---

### 3. ⚠️ **Deterministic** (MODERATE - Grade: C+)

**Critical Issues:**

#### A. Time Dependencies
```typescript
// src/hooks/useScrollPosition.test.tsx:42-43
beforeEach(() => {
  vi.useFakeTimers();  // Good!

// src/hooks/useScrollPosition.test.tsx:212-264
it('retries scroll restoration with exponential backoff', () => {
  // Simulates timing with Math.pow(2, attempt)
  // Brittle if timing logic changes
  const backoffDelay = Math.min(100 * Math.pow(2, attempt), 2000);
});
```

**Problem:** Test duplicates production timing logic - changes require updating both.

#### B. Global State Manipulation
```typescript
// src/hooks/useScrollPosition.test.tsx:52-59
window.scrollTo = vi.fn().mockImplementation((x, y) => {
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    value: y,
    configurable: true
  });
});
```

**Problem:** Modifying window object creates implicit dependencies.

#### C. Console Output Inspection
```typescript
// src/components/TalksList/TalksList.test.tsx:434, 448, 471
console.log('Talks at start:', ...);
console.log('Before click: button class:', ...);
```

**Problem:** Debug logging left in tests - indicates debugging difficulty.

**Recommendations:**

1. **Abstract timing** into injectable dependencies:
   ```typescript
   // BEFORE
   setTimeout(() => save(), 100);

   // AFTER
   interface ScrollConfig { debounceMs: number; retryDelayMs: number }
   const config = { debounceMs: 100, retryDelayMs: 200 }
   ```

2. **Use explicit test doubles** for window:
   ```typescript
   const mockWindow = {
     scrollY: 0,
     scrollTo: (x: number, y: number) => { mockWindow.scrollY = y }
   }
   ```

3. **Remove console.log** from tests - use assertions instead.

---

### 4. ⚠️ **Fast** (MODERATE - Grade: B-)

**Issues:**

#### A. Redundant Re-renders
```typescript
// src/components/TalksList/TalksList.test.tsx:108-111
fireEvent.click(toggle);
setMockSearchParams(params);
cleanup();
renderWithRouter(<TalksList />);  // Full re-render just to check state
```

**Cost:** Each re-render executes full component tree.

#### B. Complex Setup in Loops
```typescript
// src/components/TalksList/TalksList.test.tsx:190-199
for (let i = 0; i < 5; i++) {
  Object.defineProperty(window, 'scrollY', { ... });
  window.dispatchEvent(new Event('scroll'));
  vi.advanceTimersByTime(50);
}
```

#### C. Async Waiting Without Need
```typescript
// src/hooks/useTalks.test.tsx:46-57
const renderUseTalksHook = async (timeout: number = 1000) => {
  const hook = renderHook(() => useTalks(), { wrapper: TestProvider });
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false);
  }, { timeout });
  return hook;
};
```

**Problem:** Every test waits up to 1000ms even when data is immediately available.

**Recommendations:**

1. **Test state directly** instead of re-rendering:
   ```typescript
   // BEFORE
   cleanup();
   renderWithRouter(<TalksList />);
   expect(button).toHaveClass('active');

   // AFTER
   expect(mockSetSearchParams).toHaveBeenCalledWith(
     expect.objectContaining({ hasNotes: 'true' })
   );
   ```

2. **Use synchronous mocks** where possible:
   ```typescript
   vi.mock('../hooks/useTalks', () => ({
     useTalks: () => ({ talks: [...], loading: false, error: null })
   }))
   ```

3. **Reduce waitFor timeouts** to minimum (100ms for most tests).

---

### 5. ✅ **Writable** (STRONG - Grade: A-)

**Strengths:**
- Excellent test utilities: `createTalk`, `renderWithRouter`, `renderTalkCard`
- Factories reduce boilerplate significantly
- Clear patterns make new tests easy to write

**Examples:**
```typescript
// src/test/utils.tsx - Clean factory pattern
export function createTalk(overrides?: Partial<Talk>): Talk {
  return {
    id: 'test-id',
    title: 'Test Talk',
    // ... sensible defaults
    ...overrides
  }
}
```

**Minor Issues:**
- Mock setup for React Router is verbose and repeated
- Year filter test data requires manual boundary calculation

**Recommendations:**
- ✅ Keep current utility patterns
- Add more domain-specific builders (e.g., `createFilteredScenario`)
- Document test utilities with examples

---

### 6. ⚠️ **Readable** (MODERATE - Grade: B)

**Strengths:**
- Good test names describing behavior
- Organized with `describe` blocks
- AAA pattern (Arrange-Act-Assert) mostly followed

**Issues:**

#### A. Obscure Intent
```typescript
// src/hooks/useScrollPosition.test.tsx:212-264
it('retries scroll restoration with exponential backoff when target not reached', () => {
  // 50+ lines of setup
  // WHY are we testing exponential backoff?
  // WHEN does this matter in production?
  // Hidden: This prevents scroll jump when DOM hasn't rendered yet
});
```

#### B. Magic Numbers
```typescript
// src/utils/format.test.ts:26-28
it('handles decimal values correctly', () => {
  expect(formatDuration(3600.5)).toBe('1h 0m');
  expect(formatDuration(90.7)).toBe('1m');
  expect(formatDuration(30.9)).toBe('30.9s');  // Why .9 specifically?
});
```

#### C. Nested Mocking Logic
```typescript
// src/components/TalksList/TalksList.test.tsx:14-48
vi.mock('./TalkSection', () => ({
  TalkSection: (props: MockTalkSectionProps) => {
    return (
      <section>
        {/* 30+ lines of mock implementation */}
        {/* WHY this complexity? What behavior are we avoiding? */}
      </section>
    );
  }
}));
```

**Recommendations:**

1. **Add context comments** explaining "why":
   ```typescript
   it('retries scroll restoration with exponential backoff', () => {
     // Scroll position restoration can fail when DOM hasn't fully rendered
     // Exponential backoff gives layout time to settle without blocking
     // Critical for user experience on slow devices

     // Simulate: Content loads but viewport isn't scrollable yet
     mockScrollBehavior.simulateDelayedScroll();
   });
   ```

2. **Use named constants**:
   ```typescript
   const ONE_HOUR_IN_SECONDS = 3600;
   const ONE_HOUR_PLUS_HALF_SECOND = 3600.5;
   expect(formatDuration(ONE_HOUR_PLUS_HALF_SECOND)).toBe('1h 0m');
   ```

3. **Extract complex mocks** to separate files with documentation:
   ```typescript
   // test/mocks/TalkSection.mock.tsx
   /**
    * Simplified TalkSection that renders essential structure
    * without triggering nested component logic.
    * Allows testing TalksList filter behavior in isolation.
    */
   export const MockTalkSection = ...
   ```

---

### 7. ✅ **Behavioral** (STRONG - Grade: A-)

**Strengths:**
- Tests focus on user-observable behavior
- Assertions check outcomes, not internal state (mostly)
- Good use of `screen.getByRole`, `fireEvent` for user interactions

**Examples:**
```typescript
// src/components/SearchBox/SearchBox.test.tsx:19-27
it('updates url params on submit', async () => {
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'Alice react' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  await waitFor(() => expect(mockSetSearchParams).toHaveBeenCalled());
  expect(params.get('query')).toBe('Alice react');
});
```

**Minor Issues:**
- Some tests verify class names (implementation) vs. visual state
- Mock verification sometimes checks internal calls vs. end results

**Recommendations:**
- ✅ Continue behavior-focused testing
- Where possible, test visual outcomes vs. CSS classes
- Consider visual regression testing for styling concerns

---

### 8. ⚠️ **Structure-insensitive** (WEAK - Grade: C)

**Critical Issues:**

#### A. Heavy Mock Coupling
```typescript
// src/components/TalksList/TalksList.test.tsx:59-65
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [getMockSearchParams(), mockSetSearchParams]
  };
});
```

**Problem:** Tests break when:
- Hook implementation changes
- Different React Router API is used
- Component refactored to use different state management

#### B. Implementation Detail Assertions
```typescript
// src/components/TalksList/TalksList.test.tsx:103-105
expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
let params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
expect(params.get('rating')).toBe('5');
```

**Problem:** Tests know HOW the component works (it calls `setSearchParams` exactly once).

#### C. Mock Structure Dependency
```typescript
// src/hooks/useTalks.test.tsx:10-15
vi.mock('../utils/talks', () => ({
  ...vi.importActual('../utils/talks'),
  processTalks: vi.fn(),
  hasMeaningfulNotes: vi.fn().mockImplementation(...)
}));
```

**Problem:** Test breaks if `processTalks` is renamed or refactored.

**Impact:**
- Refactoring requires updating many tests
- Tests fail when structure changes but behavior doesn't
- High maintenance burden

**Recommendations:**

1. **Test through public API** instead of mocking internals:
   ```typescript
   // BEFORE (structure-sensitive)
   vi.mock('../utils/talks', () => ({ processTalks: vi.fn() }));
   expect(processTalks).toHaveBeenCalledWith(...);

   // AFTER (structure-insensitive)
   // Provide test data directly, let implementation handle it
   mockFetchResponse([validTalkData]);
   expect(result.current.talks).toHaveLength(1);
   ```

2. **Use integration-style tests** for components:
   ```typescript
   // BEFORE
   vi.mock('./TalkSection');
   vi.mock('./YearFilter');
   renderWithRouter(<TalksList />);

   // AFTER
   // Render full component tree, test end-to-end behavior
   render(<TalksList />, { wrapper: AppProviders });
   expect(screen.getByText('Engineering Culture (5)')).toBeInTheDocument();
   ```

3. **Abstract infrastructure dependencies**:
   ```typescript
   // Create adapter for React Router
   interface URLStateAdapter {
     getParams(): URLSearchParams;
     setParams(p: URLSearchParams): void;
   }

   // Test with in-memory adapter, production uses React Router
   ```

---

### 9. ✅ **Automated** (STRONG - Grade: A)

**Strengths:**
- All tests run via `npm test -- --run`
- No manual verification steps
- CI-ready test suite
- Proper exit codes on failure

**Examples:**
- All assertions are programmatic
- No `console.log` checks required (except debug artifacts)
- Tests use `expect()` throughout

**Recommendations:**
- ✅ Keep current automation level
- Remove debug `console.log` statements
- Consider adding visual regression tests with automated screenshot comparison

---

### 10. ✅ **Specific** (STRONG - Grade: A-)

**Strengths:**
- Focused test cases with single assertions (mostly)
- Clear failure messages from descriptive test names
- Good use of `describe` blocks to group related tests

**Examples:**
```typescript
// src/utils/format.test.ts:6-8
it('returns "0m" for zero seconds', () => {
  expect(formatDuration(0)).toBe('0m');
});
```

**Minor Issues:**
- Some tests have multiple assertions that could be split
- Error messages don't always explain WHY a failure matters

**Recommendations:**

1. **Split multi-assertion tests**:
   ```typescript
   // BEFORE
   it('handles missing optional fields', () => {
     expect(talk.duration).toBe(0);
     expect(talk.topics).toEqual([]);
     expect(talk.speakers).toEqual([]);
     expect(talk.description).toBe('');
     expect(talk.core_topic).toBe('');
   });

   // AFTER
   describe('missing optional fields', () => {
     it('defaults duration to 0', () => { ... });
     it('defaults topics to empty array', () => { ... });
     it('defaults speakers to empty array', () => { ... });
   });
   ```

2. **Add custom error messages**:
   ```typescript
   expect(result).toBe(expected,
     `Expected filter to preserve non-filter params when clearing year filter`
   );
   ```

---

### 11. ⚠️ **Predictive** (MODERATE - Grade: B-)

**Strengths:**
- Good coverage of edge cases (null, undefined, empty strings)
- Tests for error scenarios
- Boundary value testing (e.g., year filters, duration formatting)

**Gaps:**

#### A. Missing Integration Scenarios
```typescript
// No tests for:
// - What happens when Airtable API changes response format?
// - Browser back button with active filters?
// - Concurrent filter updates (race conditions)?
// - Network failure during talk list + filter interaction?
```

#### B. Incomplete Error Coverage
```typescript
// src/hooks/useTalks.test.tsx:206-215
it('handles invalid data format', () => {
  mockFetchResponse({ invalid: 'data', not: 'array' });
  expect(result.current.error).toBeDefined();

  // Missing: What error message does user see?
  // Missing: Can user recover without page refresh?
  // Missing: Is error logged for debugging?
});
```

#### C. Missing Real-World Scenarios
- Large dataset performance (1000+ talks)
- Rapid filter changes (user clicks multiple filters quickly)
- Accessibility interactions (keyboard navigation through filters)
- Mobile viewport behaviors

**Recommendations:**

1. **Add integration tests** for critical paths:
   ```typescript
   describe('End-to-end filtering', () => {
     it('user can search, filter by year, and navigate to talk detail', async () => {
       // Full user journey without mocking
     });
   });
   ```

2. **Test production failure modes**:
   ```typescript
   it('shows fallback UI when Airtable API is down', () => { ... });
   it('recovers gracefully from corrupt localStorage data', () => { ... });
   it('handles slow network without blocking UI', () => { ... });
   ```

3. **Add performance regression tests**:
   ```typescript
   it('filters 1000 talks in under 100ms', () => {
     const manyTalks = Array.from({ length: 1000 }, () => createTalk());
     const start = performance.now();
     filter.filter(manyTalks);
     expect(performance.now() - start).toBeLessThan(100);
   });
   ```

---

### 12. ⚠️ **Inspiring** (MODERATE - Grade: B)

**Strengths:**
- Comprehensive coverage of TalksFilter (core business logic)
- Good coverage of utility functions
- Tests give confidence in filter system

**Issues:**

#### A. Trivial Tests Dilute Confidence
```typescript
// src/utils/classNames.test.ts:4-8
describe('classNames', () => {
  it('joins class names with spaces and ignores falsy values', () => {
    expect(classNames('foo', undefined, '', 'bar', false, 'baz')).toBe('foo bar baz');
  });
});
```

**Question:** Does this test meaningfully reduce production risk?

#### B. Missing Critical Path Tests
- No test for "user finds and watches a talk" (main use case)
- No test for "curator adds new talk to Airtable" → "appears on site"
- No test for "filter state survives page refresh"

#### C. Mock-Heavy Tests Reduce Confidence
When 80% of test file is mock setup, it's unclear if production code actually works.

**Recommendations:**

1. **Add high-value integration tests**:
   ```typescript
   describe('Core User Journeys', () => {
     it('user can discover talks by topic', () => {
       // 1. User lands on homepage
       // 2. Searches for "Kent Beck"
       // 3. Filters to 2024
       // 4. Clicks talk
       // 5. Watches talk
       // No mocks - full stack
     });
   });
   ```

2. **Remove or simplify trivial tests**:
   ```typescript
   // DELETE: classNames.test.ts (trivial utility)
   // OR: Move to single "utilities.test.ts" file
   ```

3. **Test real scenarios** that scared you during development:
   ```typescript
   // "I was worried about..."
   it('handles URL with special characters in speaker names', () => { ... });
   it('gracefully handles talks with 50+ topics', () => { ... });
   it('preserves filter state when navigating back from detail page', () => { ... });
   ```

---

## Tradeoff Analysis

### Supporting Combinations
- **Isolated + Deterministic** = Reliable test suite (✅ Strong)
- **Writable + Readable** = Easy to maintain (✅ Good)
- **Automated + Specific** = Fast debugging (✅ Good)

### Interfering Combinations
- **Fast + Predictive** = Comprehensive tests are slower
  - Current: Choosing Fast (good mocking, quick tests)
  - Opportunity: Add slower integration tests for predictive confidence

- **Structure-insensitive + Writable** = Less mocking means more setup
  - Current: Heavy mocking keeps tests writable
  - Opportunity: Invest in test infrastructure to support integration tests

### Only Seeming to Interfere
- **Readable + Fast** seem to conflict (verbose tests vs. quick execution)
  - Solution: Use helper functions and factories (already doing well!)

---

## Priority Improvement Roadmap

### 🔴 **HIGH PRIORITY** (Do First - Highest Impact/Risk)

#### 1. Reduce Structure-Sensitivity (Weeks 1-2)
**Impact:** High maintainability gain, enables safe refactoring
**Effort:** Medium

**Tasks:**
- [ ] Convert `TalksList.test.tsx` from mocked to integration-style (1 day)
- [ ] Create `TestAppProvider` wrapper with real router (1 day)
- [ ] Refactor `useTalks.test.tsx` to test through API, not mocks (2 days)
- [ ] Document integration testing patterns (1 day)

**Files:**
- `src/components/TalksList/TalksList.test.tsx`
- `src/hooks/useTalks.test.tsx`
- `src/test/integrationUtils.tsx` (new)

#### 2. Improve Determinism (Week 3)
**Impact:** Eliminate flaky tests, build team confidence
**Effort:** Low

**Tasks:**
- [ ] Remove `console.log` debug statements (30 min)
- [ ] Extract timing config to injectable params (2 hours)
- [ ] Replace window mocking with test doubles (2 hours)
- [ ] Add explicit wait conditions instead of timeouts (2 hours)

**Files:**
- `src/hooks/useScrollPosition.test.tsx`
- `src/components/TalksList/TalksList.test.tsx`

---

### 🟡 **MEDIUM PRIORITY** (Do Next - Solid ROI)

#### 3. Enhance Predictiveness (Week 4)
**Impact:** Catch real production issues before deployment
**Effort:** Medium

**Tasks:**
- [ ] Add 3 end-to-end journey tests (2 days)
- [ ] Test error recovery scenarios (1 day)
- [ ] Add performance regression tests (1 day)
- [ ] Test mobile/accessibility scenarios (1 day)

**New File:** `src/test/e2e/userJourneys.test.tsx`

#### 4. Improve Readability (Week 5)
**Impact:** Faster onboarding, easier maintenance
**Effort:** Low

**Tasks:**
- [ ] Add "why" comments to complex tests (1 day)
- [ ] Extract named constants for magic numbers (1 day)
- [ ] Move complex mocks to separate files (1 day)
- [ ] Create test pattern documentation (1 day)

**New File:** `docs/testing-patterns.md`

---

### 🟢 **LOW PRIORITY** (Nice to Have)

#### 5. Optimize Speed (Week 6)
**Impact:** Faster feedback loop
**Effort:** Low

**Tasks:**
- [ ] Remove redundant re-renders (2 hours)
- [ ] Reduce waitFor timeouts (1 hour)
- [ ] Profile slow tests and optimize (2 hours)

#### 6. Increase Composability (Week 7)
**Impact:** Easier test writing
**Effort:** Low

**Tasks:**
- [ ] Split monolithic tests (2 days)
- [ ] Create scenario builders (1 day)
- [ ] Extract reusable test fragments (1 day)

---

## Measurement Plan

### Before Improvements
```bash
# Baseline Metrics
npm test -- --run --reporter=verbose > baseline.txt
# Record:
# - Total tests: ~XXX
# - Average execution time: ~XXX ms
# - Flaky tests: ~X (re-run suite 10 times)
# - Lines of test code: ~XXXX
```

### After Each Phase
```bash
# Track improvements
npm test -- --run --reporter=verbose > phase-N.txt
# Compare:
# - Test count (should stay same or increase)
# - Execution time (phase 5 should improve)
# - Flakiness (phase 2 should eliminate)
# - Maintenance burden (qualitative - survey team)
```

### Success Criteria
- ✅ Zero flaky tests (re-run suite 50 times with 100% pass rate)
- ✅ Can refactor TalksFilter without changing 90% of tests
- ✅ New developer can understand test suite in < 30 minutes
- ✅ Test suite catches at least 1 production issue per month before deployment
- ✅ Test execution time < 10 seconds for full suite

---

## Specific File Recommendations

### Highest Impact Files to Refactor

1. **src/components/TalksList/TalksList.test.tsx** (552 lines)
   - Remove TalkSection mock (lines 8-49)
   - Convert to integration tests
   - Split monolithic tests (lines 405-478)
   - Remove console.log statements

2. **src/hooks/useTalks.test.tsx** (288 lines)
   - Simplify mock setup (lines 10-43)
   - Test through public API vs. internal mocks
   - Reduce waitFor timeout from 8000ms to 100ms

3. **src/hooks/useScrollPosition.test.tsx** (281 lines)
   - Extract timing configuration
   - Replace window mocking with test doubles
   - Simplify exponential backoff test (lines 212-264)

4. **src/utils/TalksFilter.test.ts** (1104 lines)
   - ✅ Already excellent! (Keep as reference for other tests)
   - Consider extracting year filter tests to separate file

5. **src/components/TalkDetail/TalkDetail.test.tsx** (375 lines)
   - Reduce mock complexity
   - Test conference filter through user actions, not mock calls

---

## Code Examples for Implementation

### Example 1: Integration-Style Component Test

```typescript
// BEFORE (structure-sensitive)
vi.mock('./TalkSection');
vi.mock('../../hooks/useTalks');
(useTalks as ReturnType<typeof vi.fn>).mockImplementation(() => ({
  talks: [createTalk()],
  loading: false,
  error: null
}));
renderWithRouter(<TalksList />);

// AFTER (structure-insensitive)
// test/integrationUtils.tsx
export function renderWithApp(component: React.ReactElement) {
  return render(
    <MemoryRouter>
      <TestProvider talks={[createTalk()]}>
        {component}
      </TestProvider>
    </MemoryRouter>
  );
}

// TalksList.test.tsx
renderWithApp(<TalksList />);
expect(screen.getByText('Test Talk')).toBeInTheDocument();
// No mocks - tests real component behavior
```

### Example 2: Deterministic Time Handling

```typescript
// BEFORE (duplicates production logic)
const backoffDelay = Math.min(100 * Math.pow(2, attempt), 2000);
vi.advanceTimersByTime(backoffDelay);

// AFTER (tests behavior, not implementation)
const mockRetryScheduler = {
  schedule: vi.fn(),
  delays: [] as number[]
};

// Component uses injected scheduler
useScrollPosition({ retryScheduler: mockRetryScheduler });

// Test verifies retries happened, not exact timing
expect(mockRetryScheduler.schedule).toHaveBeenCalledTimes(5);
expect(mockRetryScheduler.delays).toSatisfy(delays =>
  delays.every((d, i) => i === 0 || d > delays[i - 1])
); // Verify increasing delays without hardcoding values
```

### Example 3: Readable Test with Context

```typescript
// BEFORE (obscure intent)
it('retries scroll restoration with exponential backoff when target not reached', () => {
  mockStorage.store[SCROLL_INDEX_KEY] = '500';
  window.scrollTo = vi.fn().mockImplementation((x, y) => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: Math.max(0, y - 20),
      configurable: true
    });
  });
  // ... 40 more lines
});

// AFTER (clear intent and context)
describe('Scroll Position Restoration', () => {
  /**
   * Context: When returning to the talks list, we restore the user's
   * previous scroll position. This can fail if the DOM hasn't fully rendered,
   * causing a jarring "scroll jump" as content loads.
   *
   * Solution: Retry scroll with exponential backoff, giving the layout
   * time to settle. This is critical for slow devices and long talk lists.
   */

  it('retries when content is still loading', () => {
    const SAVED_SCROLL_POSITION = 500;
    saveScrollPosition(SAVED_SCROLL_POSITION);

    // Simulate: Content loading, viewport not yet scrollable
    const domNotReady = createPartiallyLoadedDOM();

    restoreScrollPosition();

    // Verify: Multiple attempts made until DOM ready
    expect(domNotReady.scrollAttempts).toBeGreaterThan(1);
    expect(domNotReady.finalScrollY).toBe(SAVED_SCROLL_POSITION);
  });
});
```

---

## Conclusion

Your test suite has a **strong foundation** with excellent isolation, good writability, and comprehensive coverage of core logic. The main opportunities for improvement are:

1. **Structure-insensitivity** - Reduce mocking to enable refactoring
2. **Determinism** - Eliminate time dependencies and global state
3. **Predictiveness** - Add integration tests for real-world scenarios
4. **Readability** - Add context comments and extract complex mocks

**Recommended Focus:** Start with HIGH priority items (Structure-sensitivity and Determinism) as they provide the best ROI and enable all other improvements.

**Timeline:** With focused effort, all HIGH/MEDIUM priority improvements can be completed in 5-7 weeks, transforming your test suite from "good" to "excellent."

---

## Next Steps

1. Review this analysis with team
2. Prioritize based on current pain points
3. Start with one file (suggest `TalksList.test.tsx`) as pilot
4. Measure impact and adjust approach
5. Roll out patterns to remaining files

**Questions?** This analysis provides strategic direction - tactical implementation can be iterative and experimental. Start small, measure impact, and scale what works.
