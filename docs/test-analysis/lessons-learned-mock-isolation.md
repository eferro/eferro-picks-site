# Lessons Learned: Mock Isolation in Vitest

**Date:** March 14, 2026
**Context:** TalkDetail integration test attempt
**Outcome:** Blocked by global mock contamination

---

## The Problem

When attempting to convert `TalkDetail.test.tsx` to integration-style tests, we encountered a critical issue with Vitest's mocking system:

```typescript
// TalkDetail.integration.test.tsx
vi.mock('../../hooks/useTalks'); // ⚠️ This is GLOBAL and PERMANENT

describe('TalkDetail - Integration Tests', () => {
  beforeEach(() => {
    (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
      talks: [mockTalk],
      loading: false,
      error: null
    });
  });
  // ... tests
});
```

**Symptom:**
- ✅ All 27 tests pass when file runs in isolation
- ❌ 48 tests fail across 4 files when run with full test suite
- ❌ Tests in `useUrlFilter.test.tsx`, `SearchBox.test.tsx`, `TalksList.test.tsx` all break

**Root Cause:**
- `vi.mock()` is **hoisted** to the top of the file
- Creates a **file-level mock** that persists across test files
- Other test files that use `useTalks` get the contaminated mock
- No clean way to isolate mocks between test files

---

## What We Tried

###  1. `vi.restoreAllMocks()` in `afterAll`
```typescript
afterAll(() => {
  vi.restoreAllMocks(); // ❌ Insufficient
});
```
**Result:** Tests still failed - mock remained global

### 2. `vi.resetAllMocks()` in `afterEach`
```typescript
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks(); // ❌ Insufficient
});
```
**Result:** Tests still failed - mock state cleared but mock itself persists

### 3. Remove `useParams` mock
**Hypothesis:** Maybe `useParams` mock was the issue
**Result:** ❌ Didn't help - `useTalks` mock was the real problem

---

## Why Vitest Mocks Are Hard to Isolate

### 1. Hoisting
```typescript
// This code:
import { useTalks } from './hooks/useTalks';
vi.mock('./hooks/useTalks');

// Becomes:
vi.mock('./hooks/useTalks'); // ⬆️ Hoisted to top
import { useTalks } from './hooks/useTalks';
```

### 2. File-Level Scope
- Mock is created once when file loads
- Persists for the entire test run
- Affects ALL subsequent test files

### 3. Shared Module System
- Multiple test files import same module
- All get the mocked version
- No way to "unmock" for other files

---

## Solutions for Future Integration Tests

### ✅ Solution 1: Don't Mock Shared Hooks (Recommended)

**Instead of mocking `useTalks` in integration tests:**
```typescript
// ❌ DON'T: Mock the hook
vi.mock('../../hooks/useTalks');

// ✅ DO: Mock the fetch boundary
vi.mock('../../api/talks', () => ({
  fetchTalks: vi.fn().mockResolvedValue([mockTalk])
}));
```

**Pros:**
- Tests real hook implementation
- No contamination between files
- More realistic integration testing

**Cons:**
- Requires refactoring to expose fetch functions
- More setup code

---

### ✅ Solution 2: Use Dependency Injection

**Refactor components to accept hooks as props:**
```typescript
// Component with DI
export function TalkDetail({
  useTalksHook = useTalks  // ✅ Injectable dependency
}: TalkDetailProps) {
  const { talks, loading, error } = useTalksHook();
  // ...
}

// Test
render(<TalkDetail useTalksHook={() => ({
  talks: [mockTalk],
  loading: false,
  error: null
})} />);
```

**Pros:**
- No global mocks needed
- Perfect isolation
- Easy to test

**Cons:**
- Requires component refactoring
- More verbose prop types
- Less idiomatic React

---

### ✅ Solution 3: Context Provider Pattern

**Wrap hooks in context that can be mocked:**
```typescript
// TalksContext.tsx
const TalksContext = createContext<TalksContextType | null>(null);

export function TalksProvider({ children }) {
  const value = useTalks(); // Real implementation
  return <TalksContext.Provider value={value}>{children}</TalksContext.Provider>;
}

export function useTalksContext() {
  const context = useContext(TalksContext);
  if (!context) throw new Error('...');
  return context;
}

// Test
render(
  <TalksContext.Provider value={{
    talks: [mockTalk],
    loading: false,
    error: null
  }}>
    <TalkDetail />
  </TalksContext.Provider>
);
```

**Pros:**
- Clean separation of concerns
- Easy to mock in tests
- No global mocks

**Cons:**
- Requires significant refactoring
- Adds context provider layer
- More boilerplate

---

### ✅ Solution 4: Separate Test Files by Mock Scope

**Keep files with conflicting mocks separate:**
```typescript
// tests/integration/talk-detail.integration.test.ts
// ✅ Mocks useTalks here

// tests/unit/use-talks.test.ts
// ✅ Also mocks useTalks, but in separate file
```

**Run them separately:**
```bash
npm test -- integration/
npm test -- unit/
```

**Pros:**
- Works with current code
- No refactoring needed

**Cons:**
- Can't run full suite at once
- Slower CI/CD
- Awkward workflow

---

## Recommended Path Forward

### Phase 1: Infrastructure (1-2 days)
1. Create `src/api/talks.ts` with `fetchTalks()` function
2. Refactor `useTalks` to call `fetchTalks()`
3. Mock `fetchTalks` instead of `useTalks` in integration tests

### Phase 2: Gradual Adoption (ongoing)
1. New components use the pattern
2. Refactor existing components opportunistically
3. Convert integration tests one-by-one

### Phase 3: Long-term (optional)
1. Consider context provider pattern for frequently-mocked hooks
2. Document patterns in testing-patterns.md
3. Add examples to test utilities

---

## Key Takeaways

1. **Vitest `vi.mock()` is global** - affects entire test suite
2. **Isolation is critical** - one bad mock breaks many tests
3. **Mock at boundaries** - mock fetch/API, not React hooks
4. **Integration tests need different strategy** - can't use same mocking patterns as unit tests
5. **Measure twice, cut once** - test with full suite before committing

---

## References

- Vitest mocking docs: https://vitest.dev/guide/mocking.html
- Kent Beck's Test Desiderata: https://testdesiderata.com/
- Integration testing best practices: https://kentcdodds.com/blog/write-tests

---

**Status:** 📚 Documented for future reference
**Next Action:** Implement Solution 1 (Mock at API boundary) in next iteration
