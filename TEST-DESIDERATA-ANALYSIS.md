# Test Desiderata Analysis: Filter Tests

## Executive Summary

**Overall Quality:** 🟡 **Good with Critical Gaps**

The test suite demonstrates strong fundamentals (Isolated, Fast, Readable, Automated) but **failed to predict the year filter removal bug** we just fixed. This reveals gaps in **Behavioral** and **Predictive** properties, particularly around testing filter parameter handling comprehensively.

---

## Critical Finding: The Missing yearType Test

### What Happened
We just fixed a bug where clicking "×" on year filter chips didn't remove the filter. Root cause: `yearType` was missing from `TALKS_FILTER_KEYS`.

### Why Tests Didn't Catch It
**File:** `src/utils/url.test.ts:13-19`

```typescript
it('does not copy filter params', () => {
  const current = new URLSearchParams('year=2023&extra=1');
  const next = new URLSearchParams();
  const result = mergeParams(current, next);
  expect(result.get('extra')).toBe('1');
  expect(result.get('year')).toBeNull(); // ✅ Tests year
  // ❌ MISSING: expect(result.get('yearType')).toBeNull();
});
```

**Test Desiderata Violations:**
- **Behavioral** ❌ - Test didn't check actual year filter behavior (yearType parameter)
- **Predictive** ❌ - Test passed but code was broken in production

### Impact
The year filter uses TWO parameters (`year` AND `yearType`), but tests only verified one. This gave false confidence.

---

## Detailed Analysis by File

### 1. src/utils/url.test.ts

**Properties Assessment:**

| Property | Score | Notes |
|----------|-------|-------|
| Isolated | ✅ | Tests are independent, no shared state |
| Composable | 🟡 | Tests different dimensions but could be more composable |
| Deterministic | ✅ | Pure function testing, always same results |
| Fast | ✅ | Unit tests, very fast (<1ms each) |
| Writable | ✅ | Simple to write new tests |
| Readable | ✅ | Clear test names and assertions |
| Behavioral | ❌ | **CRITICAL: Missing yearType validation** |
| Structure-insensitive | ✅ | Tests behavior, not implementation |
| Automated | ✅ | Fully automated |
| Specific | ✅ | Each test covers one thing |
| Predictive | ❌ | **Failed to predict the yearType bug** |
| Inspiring | ❌ | False confidence - missed real bug |

**Issues:**

1. **Incomplete filter parameter coverage** (Line 13-19)
   - **Violation:** Behavioral, Predictive
   - **Impact:** Missed the yearType bug
   - **Fix:** Test ALL filter parameters defined in TALKS_FILTER_KEYS

2. **Hardcoded filter parameters instead of using TALKS_FILTER_KEYS**
   - **Violation:** Behavioral (tests don't track actual filter keys)
   - **Impact:** When adding new filter keys, tests don't enforce coverage
   - **Fix:** Reference TALKS_FILTER_KEYS array in tests

**Recommendations:**

```typescript
// ✅ BETTER: Test all filter keys
import { TALKS_FILTER_KEYS } from './url';

it('does not copy any filter params', () => {
  // Build URL with ALL filter keys
  const filterParams = TALKS_FILTER_KEYS.map(key => `${key}=test`).join('&');
  const current = new URLSearchParams(`${filterParams}&extra=1`);
  const next = new URLSearchParams();

  const result = mergeParams(current, next);

  // Non-filter param should be preserved
  expect(result.get('extra')).toBe('1');

  // ALL filter params should be removed
  TALKS_FILTER_KEYS.forEach(key => {
    expect(result.get(key)).toBeNull();
  });
});

it('removes year filter parameters (year and yearType)', () => {
  const current = new URLSearchParams('year=2023&yearType=specific&extra=1');
  const next = new URLSearchParams();
  const result = mergeParams(current, next);

  expect(result.get('extra')).toBe('1');
  expect(result.get('year')).toBeNull();
  expect(result.get('yearType')).toBeNull(); // ← This would have caught the bug!
});
```

---

### 2. src/hooks/useUrlFilter.test.tsx

**Properties Assessment:**

| Property | Score | Notes |
|----------|-------|-------|
| Isolated | ✅ | Uses mocks properly, clean state |
| Composable | ✅ | Tests different aspects separately |
| Deterministic | ✅ | Mocked, deterministic |
| Fast | ✅ | Fast hook tests |
| Writable | ✅ | Easy to add tests |
| Readable | ✅ | Clear test descriptions |
| Behavioral | 🟡 | Tests query but not year filter edge cases |
| Structure-insensitive | ✅ | Tests through public API |
| Automated | ✅ | Fully automated |
| Specific | ✅ | Focused tests |
| Predictive | 🟡 | Doesn't test year filter removal scenario |
| Inspiring | 🟡 | Good but incomplete coverage |

**Issues:**

1. **Missing year filter removal test**
   - **Violation:** Behavioral, Predictive
   - **Impact:** Didn't test the exact scenario that was broken
   - **Fix:** Add test for clearing complex filters (year with yearType)

**Recommendations:**

```typescript
it('clears year filter including yearType parameter', () => {
  setMockSearchParams(new URLSearchParams('year=2023&yearType=specific'));
  const { result } = renderHook(() => useUrlFilter());

  // Clear year filter
  result.current.updateFilter({ year: null, yearType: null });

  const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
  expect(params.get('year')).toBeNull();
  expect(params.get('yearType')).toBeNull(); // ← Verifies both parameters cleared
});

it('clears last2 year filter', () => {
  setMockSearchParams(new URLSearchParams('yearType=last2'));
  const { result } = renderHook(() => useUrlFilter());

  result.current.updateFilter({ yearType: null, year: null });

  const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
  expect(params.get('yearType')).toBeNull();
});
```

---

### 3. src/hooks/useFilterHandlers.test.tsx

**Properties Assessment:**

| Property | Score | Notes |
|----------|-------|-------|
| Isolated | ✅ | Excellent beforeEach cleanup |
| Composable | ✅ | Tests each handler separately |
| Deterministic | ✅ | Fully mocked |
| Fast | ✅ | Fast unit tests |
| Writable | ✅ | Easy to add handlers |
| Readable | ✅ | Excellent test structure, clear AAA pattern |
| Behavioral | ✅ | Tests actual behavior of handlers |
| Structure-insensitive | ✅ | Tests through public API |
| Automated | ✅ | Fully automated |
| Specific | ✅ | Very specific tests |
| Predictive | 🟡 | Tests handlers but not integration with URL |
| Inspiring | ✅ | Good confidence in handler logic |

**Strengths:**

This file is actually quite good! It demonstrates:
- Clear test organization with nested describes
- Good use of beforeEach for isolation
- Tests for handler stability (memoization) - great attention to detail
- Comprehensive coverage of each handler's behavior

**Issues:**

1. **Tests verify mockUpdateFilter calls but not URL parameter changes**
   - **Violation:** Predictive (doesn't test integration)
   - **Impact:** Handlers could be called correctly but URL still broken
   - **Note:** This is actually acceptable for a unit test - the issue is lack of integration tests

**Recommendations:**

These tests are well-written for their scope. The gap is at the **integration level** (tested separately in useUrlFilter tests). No changes needed here, but we should ensure integration tests exist elsewhere.

---

### 4. src/components/TalksList/ActiveFilters.test.tsx

**Properties Assessment:**

| Property | Score | Notes |
|----------|-------|-------|
| Isolated | ✅ | Good mock cleanup with beforeEach |
| Composable | ✅ | Tests each filter type separately |
| Deterministic | ✅ | Fully controlled rendering |
| Fast | ✅ | Fast render tests |
| Writable | ✅ | Easy to add filter tests |
| Readable | ✅ | Clear test names, good accessibility queries |
| Behavioral | ✅ | Tests user interactions (clicks) |
| Structure-insensitive | ✅ | Uses semantic queries (getByRole, getByLabelText) |
| Automated | ✅ | Fully automated |
| Specific | ✅ | Each test is focused |
| Predictive | 🟡 | Tests handlers called, not actual URL changes |
| Inspiring | ✅ | Good coverage of UI interactions |

**Strengths:**

- Excellent use of accessibility queries (`getByRole`, `getByLabelText`)
- Tests both rendering AND interaction for each filter
- Good test for multiple filters together

**Issues:**

1. **Tests verify handler calls but not actual filter removal**
   - **Violation:** Predictive
   - **Impact:** UI could call handlers but filters not actually removed
   - **Note:** This is acceptable for component tests - handlers are mocked

2. **Year filter test only checks "Last 2 Years" rendering, not removal**
   - **Violation:** Behavioral
   - **Impact:** Doesn't verify year filter chip removal works
   - **Fix:** Add test for year filter chip removal

**Recommendations:**

```typescript
it('calls onRemoveYearFilter when clicking year filter chip', () => {
  const emptyFilter = new TalksFilter();
  const yearFilter: YearFilterData = { type: 'last2', year: null };

  render(
    <ActiveFilters
      filter={emptyFilter}
      yearFilter={yearFilter}
      {...mockHandlers}
    />
  );

  const removeButton = screen.getByRole('button', { name: /last 2 years/i });
  fireEvent.click(removeButton);

  expect(mockHandlers.onRemoveYearFilter).toHaveBeenCalledTimes(1); // ← Test the click!
});

it('calls onRemoveYearFilter for specific year filter', () => {
  const emptyFilter = new TalksFilter();
  const yearFilter: YearFilterData = { type: 'specific', year: 2023 };

  render(
    <ActiveFilters
      filter={emptyFilter}
      yearFilter={yearFilter}
      {...mockHandlers}
    />
  );

  const removeButton = screen.getByRole('button', { name: /2023/i });
  fireEvent.click(removeButton);

  expect(mockHandlers.onRemoveYearFilter).toHaveBeenCalledTimes(1);
});
```

---

## Cross-Cutting Issues

### 1. Missing Integration Tests

**Problem:** Tests at each layer (utils, hooks, components) are good, but there's no **end-to-end integration test** verifying:

```
User clicks "×" on "Last 2 Years" chip
  → handleYearFilterChange(null) called
  → updateFilter({ yearType: null, year: null })
  → mergeParams() removes both parameters
  → URL updated to remove yearType and year
  → Filter clears, chip disappears
```

**Violation:** Predictive
**Impact:** The bug slipped through because each layer was tested in isolation

**Recommendation:** Add integration test in TalksList.test.tsx:

```typescript
it('removes year filter when clicking chip remove button', async () => {
  const talks = [
    createTalk({ id: '1', year: 2024 }),
    createTalk({ id: '2', year: 2020 }),
  ];

  mockUseTalks.mockReturnValue({
    talks,
    isLoading: false,
    error: null,
  });

  // Start with year filter active
  setMockSearchParams(new URLSearchParams('yearType=last2'));

  render(<TalksList />);

  // Verify filter is active
  expect(screen.getByText('Last 2 Years')).toBeInTheDocument();

  // Click remove button
  const removeButton = screen.getByRole('button', { name: /last 2 years/i });
  fireEvent.click(removeButton);

  // Verify URL parameters cleared
  const updatedParams = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
  expect(updatedParams.get('yearType')).toBeNull();
  expect(updatedParams.get('year')).toBeNull();
});
```

### 2. Tests Don't Reference Source of Truth

**Problem:** Tests hardcode filter parameter names instead of using `TALKS_FILTER_KEYS`

**Violation:** Behavioral (tests don't track changes to filter keys)

**Impact:** When adding new filter parameters (like yearType), tests don't enforce coverage

**Fix:** Import and use `TALKS_FILTER_KEYS` in tests

---

## Test Desiderata Tradeoffs

### Supporting Relationships ✅

- **Isolated + Deterministic** → Tests are reliable, no flaky failures
- **Fast + Automated** → Frequent execution (369 tests in 15s)
- **Readable + Specific** → Easy to debug when tests fail
- **Writable + Structure-insensitive** → Easy to maintain during refactoring

### Interfering Relationships ⚖️

- **Fast vs. Predictive:**
  - Current: Very fast unit tests, but missed integration bug
  - Tradeoff: Adding integration tests will slow down suite slightly
  - **Recommendation:** Worth it - add integration tests even if slower

- **Specific vs. Predictive:**
  - Current: Very specific tests (one assertion per test)
  - Issue: Each piece works but integration wasn't tested
  - **Recommendation:** Keep specific unit tests AND add integration tests

---

## Priority Recommendations

### 🔴 High Priority (Fix Immediately)

1. **Add yearType to url.test.ts** ✅ (Already fixed by adding yearType to TALKS_FILTER_KEYS, but update test)
   ```typescript
   it('removes all filter parameters including yearType', () => {
     const current = new URLSearchParams('year=2023&yearType=specific&extra=1');
     const next = new URLSearchParams();
     const result = mergeParams(current, next);
     expect(result.get('yearType')).toBeNull();
     expect(result.get('year')).toBeNull();
   });
   ```

2. **Add integration test for year filter removal in TalksList.test.tsx**
   - Verifies full flow from UI click to URL update
   - Prevents similar bugs in future

### 🟡 Medium Priority (Next Sprint)

3. **Make url.test.ts reference TALKS_FILTER_KEYS array**
   - Ensures tests cover all filter parameters automatically
   - New filter keys require test coverage

4. **Add year filter removal tests to useUrlFilter.test.tsx**
   - Test clearing complex filters (yearType + year)
   - Test all year filter types (last2, last5, specific, before, after)

### 🟢 Low Priority (Nice to Have)

5. **Add year filter chip removal tests to ActiveFilters.test.tsx**
   - Currently tests rendering but not clicking "×"
   - Low priority because integration test covers this

6. **Consider property-based testing for mergeParams()**
   - Generate random filter combinations
   - Verify invariants (filter keys always removed, non-filter keys preserved)

---

## Conclusion

**Overall Assessment:** The test suite has strong fundamentals but revealed a critical gap in the **Predictive** property by missing the yearType bug.

**Key Insight:** Testing each layer in isolation (utils, hooks, components) is necessary but not sufficient. The bug existed in the **integration between layers** - specifically in how filter parameters flow from UI → handlers → URL updates.

**Actionable Takeaway:** Add integration tests that verify complete user flows, especially for complex features like filters that span multiple layers.

**Test Desiderata Violated:**
- ❌ **Behavioral** - Tests didn't check all filter parameters
- ❌ **Predictive** - Tests passed but code was broken
- ❌ **Inspiring** - False confidence due to incomplete coverage

**Next Steps:**
1. ✅ Fix already applied (yearType added to TALKS_FILTER_KEYS)
2. Add integration test for year filter removal
3. Update url.test.ts to test all filter keys comprehensively
4. Add tests for other year filter types (last5, before, after)

---

## Resources

- Kent Beck's Test Desiderata: https://testdesiderata.com/
- Original Essay: https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3
