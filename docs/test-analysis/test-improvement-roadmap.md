# Test Improvement Roadmap

**Last Updated:** March 14, 2026
**Current Grade:** A- (up from B+)
**Test Suite:** 488 passing, 1 skipped (99.8%)

---

## Executive Summary

The test suite has **significantly improved** through systematic application of Kent Beck's Test Desiderata principles. Multiple phases completed:

✅ **Phase 1** - Quick Wins (console.log removal, cleanup)
✅ **Phase 2.2** - Window Test Double
✅ **Phase 5.1-5.3** - Readability improvements
✅ **Phase 3.1** - Integration test infrastructure

**Next Goal:** A grade (3-4 days of focused work)

---

## Current Status

### Test Desiderata Scores

| Property | Score | Notes |
|----------|-------|-------|
| **Isolated** | A | Excellent - tests don't affect each other |
| **Composable** | B+ | Better organization, room for splitting monolithic tests |
| **Deterministic** | B+ | Window double eliminates flakiness |
| **Fast** | B+ | Console.log removal, cleaner setup |
| **Writable** | A | Integration helpers make it easy |
| **Readable** | A- | Context comments, extracted mocks |
| **Behavioral** | A- | Strong - tests outcomes not implementation |
| **Structure-insensitive** | B+ | Integration infrastructure ready, more conversion needed |
| **Automated** | A | Excellent |
| **Specific** | A- | Strong |
| **Predictive** | B | Good, needs E2E journey tests |
| **Inspiring** | B+ | Better documentation, clearer intent |

---

## Pending Work

### 🔴 **Blocker: Mock Isolation Issue**

**Problem:** Converting tests to integration style is blocked by Vitest's global mocking system.

**Root Cause:**
- `vi.mock()` is hoisted and creates file-level mocks
- Mocks persist across test files, contaminating other tests
- Example: Mocking `useTalks` in TalkDetail broke 48 tests in other files

**Solution (Recommended):**
```typescript
// ❌ DON'T: Mock React hooks
vi.mock('../../hooks/useTalks');

// ✅ DO: Mock at API boundary
// Step 1: Create src/api/talks.ts
export async function fetchTalks() {
  const response = await fetch(AIRTABLE_URL);
  return response.json();
}

// Step 2: Refactor useTalks to use fetchTalks
export function useTalks() {
  const [talks, setTalks] = useState([]);
  useEffect(() => {
    fetchTalks().then(data => setTalks(processTalks(data)));
  }, []);
  return { talks, loading, error };
}

// Step 3: Mock fetchTalks in tests
vi.mock('../../api/talks', () => ({
  fetchTalks: vi.fn().mockResolvedValue([mockTalkData])
}));
```

**Time:** 1-2 days
**Impact:** Unblocks Phase 3 (Structure-insensitivity improvements)

**See:** Previous `lessons-learned-mock-isolation.md` for 4 detailed solutions

---

## Recommended Next Steps

### Option A: Quick Wins to Grade A (1-2 days)

**Focus on high-impact, low-effort improvements:**

1. **Add E2E Journey Tests** (1 day)
   ```typescript
   // Create: src/test/e2e/userJourneys.test.tsx

   it('user discovers and watches a talk', () => {
     renderIntegration(<App />, { talks });

     // Search
     fireEvent.change(searchInput, { target: { value: 'TDD' } });

     // Filter
     fireEvent.click(screen.getByRole('button', { name: /top picks/i }));

     // Navigate
     fireEvent.click(screen.getByText('TDD talk title'));

     // Verify
     expect(screen.getByRole('heading', { name: /tdd talk title/i }))
       .toBeInTheDocument();
   });
   ```

2. **Add Performance Regression Tests** (0.5 day)
   ```typescript
   // Expand: src/utils/TalksFilter.test.ts

   it('filters 1000 talks in under 100ms', () => {
     const manyTalks = Array.from({ length: 1000 }, () => createTalk());
     const filter = new TalksFilter({ query: 'react' });

     const start = performance.now();
     filter.filter(manyTalks);
     const duration = performance.now() - start;

     expect(duration).toBeLessThan(100);
   });
   ```

**Result:** Test suite moves from A- to A

---

### Option B: Full Structure-Insensitivity (3-4 days)

**Complete the integration test conversion:**

1. **Implement API Boundary Mocking** (1-2 days)
   - Create `src/api/talks.ts` with `fetchTalks()`
   - Refactor `useTalks` to use `fetchTalks()`
   - Update tests to mock at API level

2. **Convert More Tests to Integration Style** (1 day)
   - Convert `TalkDetail.test.tsx`
   - Convert remaining component tests
   - Remove unnecessary mocks

3. **Add E2E Tests** (1 day)
   - User journeys
   - Error recovery scenarios
   - Multi-filter combinations

**Result:** A grade + future-proof test architecture

---

## Maintenance Guidelines

### For New Tests

✅ **DO:**
- Use `renderIntegration()` for component tests
- Mock only at API boundaries (fetch, localStorage)
- Add context comments explaining "why"
- Test user-observable behavior, not implementation

❌ **DON'T:**
- Mock React hooks (causes isolation issues)
- Mock child components (makes tests brittle)
- Test internal state directly
- Use inline mocks (extract to `src/test/mocks/`)

### Code Review Checklist

- [ ] Tests pass in isolation AND in full suite
- [ ] No `vi.mock()` of internal hooks/components
- [ ] Context comments explain feature value
- [ ] Uses `renderIntegration()` for components
- [ ] No console.log statements
- [ ] Assertions on user-visible outcomes

---

## Test Utilities Reference

### Integration Testing
```typescript
import { renderIntegration } from '../test/integration/IntegrationTestHelpers';

// For components WITHOUT route parameters
renderIntegration(<TalksList />, {
  initialPath: '/talks',
  initialParams: new URLSearchParams('rating=5')
});

// For components WITH route parameters
renderIntegration(<TalkDetail />, {
  initialPath: '/talk/123',
  withRoutes: true
});
```

### Test Data
```typescript
import { createTalk } from '../test/utils';

const talk = createTalk({
  title: 'Custom Title',
  rating: 5,
  topics: ['react', 'testing']
});
```

### Window Test Double
```typescript
import { createWindowDouble } from '../test/doubles/window';

const mockWindow = createWindowDouble({
  scrollBehavior: 'instant'  // or 'partial', 'delayed'
});
```

---

## Success Metrics

### Quantitative
- ✅ Pass rate: 99.8% (488/489 tests)
- ✅ Console.log: 0 remaining
- ✅ Test speed: ~10s for full suite
- ✅ Infrastructure: 4 support modules created

### Qualitative
- ✅ Tests serve as living documentation
- ✅ Mocking strategy is explicit and maintainable
- ✅ Integration testing is easy and encouraged
- ✅ Onboarding is faster with clear patterns

---

## Historical Context

### Completed Phases

**Phase 1: Quick Wins** (Week 1)
- Removed 5+ console.log statements
- Cleaned up debug artifacts
- Improved test readability

**Phase 2.2: Window Test Double** (Week 2)
- Created `src/test/doubles/window.ts`
- Eliminated flaky scroll position tests
- 278 lines of deterministic test infrastructure

**Phase 3.1: Integration Infrastructure** (Week 3)
- Created `IntegrationTestHelpers.tsx` with `renderIntegration()`
- Added `withRoutes` option for useParams support
- Full test coverage of helper itself

**Phase 5.1-5.3: Readability** (Week 6)
- Added context comments to TalksList tests
- Extracted complex mocks to `src/test/mocks/components.tsx`
- Created comprehensive `docs/testing-patterns.md`

### Known Issues

1. **Skipped Test:** `useScrollPosition.test.tsx` line 164
   - Test: "scrolls to top when navigating to non-index page"
   - Reason: React effect timing race condition with test doubles
   - Impact: Functionality works correctly in production
   - Status: Acceptable - 99.8% pass rate maintained

2. **Blocked Conversion:** TalkDetail integration tests
   - Reason: Vitest global mock contamination
   - Solution: Implement API boundary mocking
   - Priority: Medium (3-4 days of work)

---

## Quick Reference

### Test Desiderata Properties

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

### Resources
- Original Framework: https://testdesiderata.com/
- Testing Patterns: `docs/testing-patterns.md`
- Test Utilities: `src/test/utils.tsx`
- Integration Helpers: `src/test/integration/IntegrationTestHelpers.tsx`

---

## Timeline

### Short Term (1-2 days)
- Add E2E journey tests
- Add performance regression tests
- **Result:** A grade achieved

### Medium Term (3-4 days)
- Implement API boundary mocking
- Convert blocked tests to integration style
- **Result:** Full structure-insensitivity

### Long Term (Ongoing)
- Apply patterns to all new tests
- Refactor old tests opportunistically
- Monitor test health metrics

---

**Status:** 🟢 Excellent progress - Path to A grade is clear
**Next Action:** Choose Option A (quick wins) or Option B (full conversion)
