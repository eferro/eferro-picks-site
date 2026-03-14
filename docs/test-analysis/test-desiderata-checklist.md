# Test Desiderata Quick Reference Checklist

Use this checklist when writing or reviewing tests.

---

## ✅ The 12 Test Desiderata Properties

### 1. **Isolated** - Tests don't affect each other
- [ ] Each test has `beforeEach` that resets state
- [ ] No shared mutable state between tests
- [ ] Tests can run in any order
- [ ] Uses `vi.clearAllMocks()` before each test

### 2. **Composable** - Test dimensions independently
- [ ] One test = one behavior/dimension
- [ ] Can combine test scenarios using helpers
- [ ] Tests aren't monolithic (< 30 lines per test)
- [ ] Uses factories like `createTalk()` for reuse

### 3. **Deterministic** - Same code = same result
- [ ] No `Math.random()` or real dates
- [ ] No sleeps/waits based on wall-clock time
- [ ] Uses `vi.useFakeTimers()` for time-dependent code
- [ ] No global state mutation (window, document)
- [ ] No debug `console.log` statements

### 4. **Fast** - Runs quickly during development
- [ ] Single test runs in < 50ms
- [ ] Full suite runs in < 10 seconds
- [ ] Minimal async/await (use sync mocks where possible)
- [ ] No redundant re-renders
- [ ] Uses short timeouts in `waitFor` (< 100ms)

### 5. **Writable** - Easy to create new tests
- [ ] Uses test utilities (`renderIntegration`, `createTalk`)
- [ ] Minimal boilerplate (< 10 lines of setup)
- [ ] Clear patterns to follow
- [ ] Helper functions for common scenarios

### 6. **Readable** - Clear intent and motivation
- [ ] Test name describes the behavior being tested
- [ ] Follows Arrange-Act-Assert pattern
- [ ] Complex tests have "why" comments
- [ ] Uses named constants instead of magic numbers
- [ ] Test structure mirrors user actions

### 7. **Behavioral** - Tests user-observable outcomes
- [ ] Asserts on what user sees/experiences
- [ ] Uses `screen.getByRole` (accessibility-first)
- [ ] Avoids testing internal state directly
- [ ] Focuses on behavior, not implementation

### 8. **Structure-insensitive** - Survives refactoring
- [ ] Minimal mocking (only external services)
- [ ] Tests through public API
- [ ] Integration tests over unit tests for components
- [ ] Can refactor implementation without changing test
- [ ] Doesn't verify mock call counts/order

### 9. **Automated** - No manual steps
- [ ] All assertions are programmatic (`expect`)
- [ ] No manual inspection of console output
- [ ] Runs via `npm test -- --run`
- [ ] CI-ready

### 10. **Specific** - Failures pinpoint problems
- [ ] One assertion per test (or closely related group)
- [ ] Clear error messages
- [ ] Test name makes failure obvious
- [ ] Fails fast (early assertions)

### 11. **Predictive** - Catches real production issues
- [ ] Tests real user scenarios
- [ ] Covers error/edge cases
- [ ] Includes integration tests for critical paths
- [ ] Tests what actually broke in production
- [ ] Performance tests for known bottlenecks

### 12. **Inspiring** - Builds confidence in the system
- [ ] Tests important behaviors (not trivial utilities)
- [ ] End-to-end tests for main user journeys
- [ ] Tests give confidence to deploy
- [ ] Team references tests when discussing features

---

## 🚦 Test Quality Score

Rate each property (0-2 points):
- **0**: Not present/violated
- **1**: Partially present
- **2**: Fully satisfied

**Total Score:**
- 20-24: Excellent (A)
- 16-19: Good (B)
- 12-15: Needs Improvement (C)
- 0-11: Poor (D/F)

---

## 🎯 Test Type Decision Tree

```
Writing a new test?
│
├─ Is it a pure function (no dependencies)?
│  └─ YES → Unit Test
│     - Mock nothing
│     - Fast and simple
│     - Example: TalksFilter.test.ts
│
├─ Is it a React component?
│  └─ YES → Integration Test
│     - Render with providers
│     - Mock only external APIs
│     - Example: TalksList (refactored)
│
├─ Is it a critical user journey?
│  └─ YES → End-to-End Test
│     - No mocks
│     - Test full stack
│     - Example: Search → Filter → View
│
└─ Is it a hook with dependencies?
   └─ YES → Integration Test
      - Provide real dependencies
      - Mock only I/O boundaries
      - Example: useTalks (refactored)
```

---

## ⚠️ Anti-Patterns to Avoid

### ❌ DON'T: Mock Everything
```typescript
vi.mock('./TalkSection');
vi.mock('./YearFilter');
vi.mock('../../hooks/useTalks');
vi.mock('../../utils/TalksFilter');
renderWithRouter(<TalksList />);
```
**Problem:** Test is coupled to implementation structure

### ✅ DO: Test Through Public API
```typescript
const talks = [createTalk({ title: 'React' })];
renderIntegration(<TalksList />, { talks });
expect(screen.getByText('React')).toBeInTheDocument();
```
**Benefit:** Survives refactoring

---

### ❌ DON'T: Test Implementation Details
```typescript
expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
expect(mockSetSearchParams.mock.calls[0][0].get('rating')).toBe('5');
```
**Problem:** Breaks when implementation changes

### ✅ DO: Test User-Observable Outcomes
```typescript
fireEvent.click(screen.getByRole('button', { name: /top picks/i }));
expect(window.location.search).toContain('rating=5');
```
**Benefit:** Tests what matters to users

---

### ❌ DON'T: Write Monolithic Tests
```typescript
it('filters talks and updates UI and navigates correctly', () => {
  // 100+ lines testing multiple concerns
});
```
**Problem:** Hard to understand, slow to debug

### ✅ DO: Test One Behavior Per Test
```typescript
describe('Has Notes Filter', () => {
  it('updates URL when clicked', () => { ... });
  it('shows only talks with notes', () => { ... });
  it('applies active styling', () => { ... });
});
```
**Benefit:** Specific, debuggable

---

### ❌ DON'T: Use Long Timeouts
```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false);
}, { timeout: 5000 });
```
**Problem:** Slow tests, hides issues

### ✅ DO: Use Fast, Deterministic Mocks
```typescript
vi.mock('../../hooks/useTalks', () => ({
  useTalks: () => ({ talks: [...], loading: false })
}));
// No waiting needed!
```
**Benefit:** Fast, predictable

---

### ❌ DON'T: Leave Debug Artifacts
```typescript
console.log('Current state:', result.current);
console.log('Props:', props);
```
**Problem:** Clutters test output, indicates debugging struggles

### ✅ DO: Use Proper Debugging Tools
```typescript
// When debugging:
screen.debug();  // Shows current DOM

// In test:
expect(result).toMatchObject({
  loading: false,
  talks: expect.arrayContaining([...])
});
```
**Benefit:** Clean, maintainable

---

## 🔍 Code Review Checklist

When reviewing test changes:

### Structure
- [ ] Tests are organized with clear `describe` blocks
- [ ] Test names describe behavior, not implementation
- [ ] Follows project testing patterns

### Quality
- [ ] Uses `renderIntegration` for components (not heavy mocking)
- [ ] Mocks only external services (fetch, localStorage)
- [ ] No `console.log` debug statements
- [ ] Uses named constants for magic numbers

### Reliability
- [ ] Tests run consistently (no flakiness)
- [ ] No race conditions or timing dependencies
- [ ] Proper cleanup in `beforeEach`/`afterEach`

### Coverage
- [ ] Tests cover the happy path
- [ ] Tests cover error scenarios
- [ ] Tests cover edge cases (null, empty, boundary values)

### Maintainability
- [ ] Can refactor production code without breaking tests
- [ ] Tests are easy to understand in 2 minutes
- [ ] Reuses existing test utilities

---

## 📊 Project-Specific Patterns

### ✅ Good Patterns in This Project

1. **TalksFilter Tests** (`src/utils/TalksFilter.test.ts`)
   - Pure function testing
   - Comprehensive edge cases
   - Fast and deterministic
   - **Use as template for utility tests**

2. **Test Factories** (`src/test/utils.tsx`)
   - `createTalk()` with sensible defaults
   - `renderWithRouter()` for component testing
   - **Use these in all tests**

3. **Isolation** (across all tests)
   - Consistent `beforeEach` cleanup
   - No test interdependencies
   - **Maintain this pattern**

### ⚠️ Patterns to Avoid

1. **Heavy Mocking** (`src/components/TalksList/TalksList.test.tsx`)
   - Mocks TalkSection, YearFilter, hooks
   - Brittle, structure-sensitive
   - **Refactor to integration tests**

2. **Complex Setup** (`src/hooks/useScrollPosition.test.tsx`)
   - 50+ lines of window mocking
   - Duplicates production logic in tests
   - **Extract to test doubles**

3. **Redundant Re-renders** (multiple test files)
   - cleanup() + full re-render to check state
   - Slows tests unnecessarily
   - **Test state directly or use integration approach**

---

## 🎓 Learning Resources

### Kent Beck's Test Desiderata
- **Website:** https://testdesiderata.com/
- **Essay:** https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3
- **Videos:** Each property has 5-minute YouTube video

### Project Documentation
- **Full Analysis:** `test-desiderata-analysis.md`
- **Improvement Plan:** `test-improvement-plan.md`
- **Testing Patterns:** `docs/testing-patterns.md` (create in Phase 5)

---

## 🚀 Quick Start: Writing Your First Test

### 1. Choose Test Type
- **Pure function?** → Unit test
- **Component?** → Integration test
- **User journey?** → E2E test

### 2. Use Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderIntegration } from '../../test/integrationUtils';
import { createTalk } from '../../test/utils';

describe('MyComponent', () => {
  beforeEach(() => {
    // Reset any mocks/state
  });

  it('describes the specific behavior being tested', () => {
    // Arrange: Set up test data
    const talk = createTalk({ title: 'Test Talk' });

    // Act: Render component and perform action
    renderIntegration(<MyComponent />, { talks: [talk] });
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));

    // Assert: Verify user-observable outcome
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### 3. Run and Verify
```bash
npm test -- --run MyComponent.test.tsx
```

### 4. Check Against Desiderata
Use the checklist above - aim for all green checkmarks!

---

## 📝 Summary

**Good test = answers these questions:**
1. **What** behavior is being tested? (Test name)
2. **Why** does it matter? (Context comment)
3. **How** do we know it works? (Assertions)

**Bad test = creates these problems:**
1. Breaks when refactoring (structure-sensitive)
2. Flakes randomly (non-deterministic)
3. Takes forever to run (slow)
4. Hard to understand why it failed (not specific)
5. Doesn't catch real bugs (not predictive)

**Remember:**
- Tests are code too - maintain them!
- Refactor tests as you refactor production code
- When in doubt, make it more like `TalksFilter.test.ts`
- Default to integration tests for React components
- Mock only at boundaries (API, localStorage, etc.)

---

**Last Updated:** 2026-03-13
**Status:** Active improvement plan in progress
