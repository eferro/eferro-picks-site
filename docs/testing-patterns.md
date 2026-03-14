# Testing Patterns

## Philosophy

We follow **Kent Beck's Test Desiderata** - a framework for evaluating test quality:

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

```typescript
// src/utils/TalksFilter.test.ts
it('filters by year correctly', () => {
  const talks = [
    createTalk({ year: 2023 }),
    createTalk({ year: 2024 })
  ];
  const filter = new TalksFilter({ year: 2023 });
  expect(filter.filter(talks)).toHaveLength(1);
});
```

### Integration Tests
**Use for:** Components, hooks with dependencies

**Example:** `TalksList`, `SearchBox`, `useTalks`

**Speed:** < 50ms per test

**Mocking:** Only external services (API, localStorage)

```typescript
// src/components/TalksList/TalksList.integration.test.tsx
it('filters talks by rating', () => {
  const talks = [
    createTalk({ rating: 5, title: '5-star talk' }),
    createTalk({ rating: 4, title: '4-star talk' })
  ];

  (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
    talks,
    loading: false,
    error: null
  });

  renderIntegration(<TalksList />, {
    initialParams: new URLSearchParams('rating=5')
  });

  expect(screen.getByText('5-star talk')).toBeInTheDocument();
  expect(screen.queryByText('4-star talk')).not.toBeInTheDocument();
});
```

### End-to-End Tests
**Use for:** Critical user journeys

**Example:** Search → Filter → View Talk → Navigate Back

**Speed:** < 500ms per test

**Mocking:** None (or minimal)

```typescript
// src/test/e2e/userJourneys.test.tsx
it('user discovers and filters talks', async () => {
  renderIntegration(<App />, { talks: sampleTalks });

  // User searches
  const searchInput = screen.getByPlaceholderText(/search/i);
  fireEvent.change(searchInput, { target: { value: 'react' } });
  fireEvent.submit(searchInput.closest('form')!);

  // User sees filtered results
  await waitFor(() => {
    expect(screen.getByText('React Talk')).toBeInTheDocument();
  });
});
```

## Test Utilities

### `createTalk(overrides?)`
Create test talk data with sensible defaults.

```typescript
const talk = createTalk({
  id: '1',
  title: 'Test Talk',
  rating: 5,
  topics: ['testing']
});
```

### `renderIntegration(component, options?)`
Render component with full app context (router, providers).

```typescript
renderIntegration(<TalksList />, {
  initialPath: '/talks',
  initialParams: new URLSearchParams('rating=5')
});
```

### `renderWithRouter(component)`
Render component with mocked router (for unit tests).

```typescript
renderWithRouter(<Component />);
```

## Common Patterns

### Testing Filters

```typescript
// ✅ Good: Test through user actions
fireEvent.change(searchInput, { target: { value: 'react' } });
fireEvent.submit(searchForm);
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

### Test Data Creation

```typescript
// ✅ Good: Use helper with overrides
const talks = [
  createTalk({ id: '1', rating: 5 }),
  createTalk({ id: '2', rating: 4 })
];

// ❌ Bad: Inline complex objects
const talks = [{
  id: '1',
  title: 'Test',
  url: 'http://test.com',
  speakers: [],
  topics: [],
  // ... 20 more fields
}];
```

## Integration vs Unit Test Decision Tree

**Choose Integration Test when:**
- Component has 2+ child components
- Testing user workflows (multi-step interactions)
- Testing filter combinations
- Testing navigation flows

**Choose Unit Test when:**
- Testing pure function (no dependencies)
- Testing simple component (no children)
- Testing isolated hook logic
- Testing utility functions

## Project-Specific Patterns

### TalksFilter Class
**Always use TalksFilter for filtering logic:**

```typescript
// ✅ Good: Centralized filtering
const filter = TalksFilter.fromUrlParams(searchParams);
const filteredTalks = filter.filter(talks);

// ❌ Bad: Direct URL parameter manipulation
const author = searchParams.get('author');
const filtered = talks.filter(t => t.speakers.includes(author));
```

### Testing URL State

```typescript
it('updates URL on filter change', () => {
  renderIntegration(<TalksList />, {
    initialParams: new URLSearchParams('rating=5')
  });

  fireEvent.click(screen.getByRole('button', { name: /top picks/i }));

  // Verify filter state through TalksFilter
  const params = new URLSearchParams(window.location.search);
  const filter = TalksFilter.fromUrlParams(params);
  expect(filter.rating).toBe(5);
});
```

### Testing with Test Doubles

```typescript
// Use Window test double for scroll testing
import { createWindowDouble } from '../test/doubles/window';

it('restores scroll position', () => {
  const mockWindow = createWindowDouble({
    initialScrollY: 500
  });

  // Test with deterministic behavior
  mockWindow.scrollTo(0, 500);
  expect(mockWindow.scrollY).toBe(500);
});
```

## Debugging Failed Tests

1. **Read the test name** - what behavior failed?
2. **Check the assertion** - what was expected vs. actual?
3. **Look for console.error** - React warnings?
4. **Run test in isolation:** `npm test -- --run ComponentName.test.tsx`
5. **Add debug output:** `screen.debug()` or `console.log()`
6. **Check mock setup** - are mocks configured correctly?

## Performance Testing

```typescript
describe('Performance', () => {
  it('filters 1000 talks in under 100ms', () => {
    const manyTalks = Array.from({ length: 1000 }, (_, i) =>
      createTalk({ id: `${i}`, title: `Talk ${i}` })
    );

    const start = performance.now();
    const result = filter.filter(manyTalks);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result.length).toBeGreaterThan(0);
  });
});
```

## Maintenance Rules

1. **Before adding a test:** Check if similar test exists
2. **Before mocking:** Ask if integration test is better
3. **Before breaking up test:** Check if it tests one behavior
4. **After refactoring:** Run full suite to catch structure-sensitivity
5. **When test is flaky:** Fix root cause, don't add retries

## Test Organization

```
src/
├── components/
│   ├── TalksList/
│   │   ├── index.tsx
│   │   ├── TalksList.test.tsx          # Component tests
│   │   └── TalksList.integration.test.tsx  # Integration tests
├── hooks/
│   ├── useTalks.ts
│   └── useTalks.test.tsx               # Hook tests
├── utils/
│   ├── TalksFilter.ts
│   └── TalksFilter.test.ts             # Pure function tests
└── test/
    ├── doubles/                        # Test doubles (window, etc.)
    ├── e2e/                           # End-to-end user journeys
    ├── integration/                    # Integration test helpers
    ├── mocks/                         # Shared mocks
    └── utils.tsx                      # Test utilities
```

## Anti-Patterns to Avoid

### ❌ Testing Implementation Details

```typescript
// Bad: Tests how filtering works internally
expect(processTalks).toHaveBeenCalledWith(mockData);
expect(filterTalks).toHaveBeenCalledWith(processed, 'English');

// Good: Tests what user sees
expect(screen.getByText('English Talk')).toBeInTheDocument();
expect(screen.queryByText('Spanish Talk')).not.toBeInTheDocument();
```

### ❌ Over-Mocking

```typescript
// Bad: Mocks everything
vi.mock('./TalkSection');
vi.mock('./TalkCard');
vi.mock('./SearchBox');
vi.mock('../../utils/TalksFilter');

// Good: Only mock data boundary
(useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
  talks: testTalks,
  loading: false,
  error: null
});
```

### ❌ Brittle Selectors

```typescript
// Bad: Coupled to structure
const button = container.querySelector('.filters > div:nth-child(2) > button');

// Good: Uses accessibility roles
const button = screen.getByRole('button', { name: /filter by year/i });
```

### ❌ Non-Deterministic Tests

```typescript
// Bad: Depends on current date
expect(filter.year).toBe(new Date().getFullYear());

// Good: Inject test date
const filter = new TalksFilter({
  yearType: 'last2',
  _testCurrentYear: 2024
});
expect(filter.year).toBe(2024);
```

## CI/CD Integration

```bash
# Run all tests
npm test -- --run

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --run src/utils/TalksFilter.test.ts

# Run tests for changed files (Git)
npm test -- --run --changed
```

## Test Quality Metrics

**Quantitative:**
- Test suite speed: < 10 seconds for full suite ✅
- Test stability: 100% pass rate over 50 runs ✅
- Code coverage: Maintain or improve current coverage ✅

**Qualitative:**
- Can you understand a failing test in < 2 minutes?
- Can you add a new test without looking at examples?
- Do tests help you refactor with confidence?
- Have tests caught production bugs before deployment?

## Further Reading

- [Kent Beck's Test Desiderata](https://kentbeck.github.io/TestDesiderata/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about#priority)
- [Vitest Documentation](https://vitest.dev/)
- [Testing React Applications](https://reactjs.org/docs/testing.html)

---

**Remember:** Good tests give you confidence to refactor and add features. If tests are painful to write or maintain, that's a signal to improve the test strategy, not skip testing.
