# Integration Testing Guide

## When to Use Integration Tests

**Use integration tests for:**
- Components with complex child hierarchies (TalksList, TalkDetail)
- User workflows (search → filter → view → navigate back)
- Data transformation pipelines (API → processing → display)

**Use unit tests for:**
- Pure functions (TalksFilter class, formatDuration, classNames)
- Simple components with no children
- Isolated hook behavior

## Integration Test Pattern

```typescript
import { renderIntegration } from '../../test/integration/IntegrationTestHelpers';
import { useTalks } from '../../hooks/useTalks';
import { createTalk } from '../../test/utils';

// Mock only the data boundary
vi.mock('../../hooks/useTalks');

describe('Feature Integration', () => {
  it('user performs complete workflow', async () => {
    // Arrange: Provide test data
    const talks = [
      createTalk({ id: '1', rating: 5 }),
      createTalk({ id: '2', rating: 4 })
    ];

    (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
      talks,
      loading: false,
      error: null
    });

    // Act: Render with initial state
    renderIntegration(<Component />, {
      initialPath: '/talks',
      initialParams: new URLSearchParams('rating=5')
    });

    // Assert: Verify user-visible outcome
    expect(screen.getByText('5-star talk')).toBeInTheDocument();
    expect(screen.queryByText('4-star talk')).not.toBeInTheDocument();

    // Act: User interaction
    fireEvent.click(screen.getByRole('button', { name: /clear filter/i }));

    // Assert: Verify updated outcome
    await waitFor(() => {
      expect(screen.getByText('4-star talk')).toBeInTheDocument();
    });
  });
});
```

## Key Principles

1. **Mock at the boundary** - Only mock external services (API, localStorage), not internal functions
2. **Test user behavior** - Verify what users see, not implementation details
3. **Real components** - Let actual child components render
4. **Real business logic** - Don't mock TalksFilter, processTalks, etc.

## Migration from Unit Tests

### Before (structure-sensitive):
```typescript
vi.mock('./ChildComponent');
vi.mock('../../utils/helper');

renderWithRouter(<Component />);
expect(mockSetSearchParams).toHaveBeenCalledWith({ filter: 'value' });
```

### After (structure-insensitive):
```typescript
// No child component mocks
// Real helper functions run

renderIntegration(<Component />, {
  initialParams: new URLSearchParams('filter=value')
});

// Verify actual outcome
expect(screen.getByText('Filtered Result')).toBeInTheDocument();
```

## Examples from the Codebase

### Example 1: TalkCard Navigation
```typescript
it('navigates to talk detail with filters preserved', () => {
  const talk = createTalk({ id: 'test-123' });
  const initialParams = new URLSearchParams('rating=5&hasNotes=true');

  const { container } = renderIntegration(
    <>
      <TalkCard talk={talk} {...handlers} />
      <LocationDisplay />
    </>,
    { initialPath: '/talks', initialParams }
  );

  // Click the card - real navigation happens
  const card = screen.getByRole('article');
  fireEvent.click(card);

  // Verify navigation with preserved filters
  expect(screen.getByTestId('current-location'))
    .toHaveTextContent('/talk/test-123?rating=5&hasNotes=true');
});
```

### Example 2: TalksList Filtering
```typescript
it('filters talks by format', async () => {
  const talks = [
    createTalk({ id: '1', title: 'A Podcast', format: 'podcast' }),
    createTalk({ id: '2', title: 'A Talk', format: 'talk' })
  ];

  (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
    talks,
    loading: false,
    error: null
  });

  renderIntegration(<TalksList />, {
    initialParams: new URLSearchParams('format=podcast')
  });

  // Real TalksFilter applies format filtering
  await waitFor(() => {
    expect(screen.getByText('A Podcast')).toBeInTheDocument();
  });
  expect(screen.queryByText('A Talk')).not.toBeInTheDocument();
});
```

### Example 3: End-to-End Data Transformation
```typescript
it('transforms complete Airtable items', async () => {
  const airtableItem = {
    airtable_id: 'rec123',
    name: 'Advanced TypeScript',
    url: 'https://youtube.com/watch?v=abc',
    duration: 2700,
    topics_names: ['typescript', 'advanced'],
    speakers_names: ['Jane Smith'],
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024
  };

  mockFetchResponse([airtableItem]);
  const { result } = await renderUseTalksHook();

  // Real processTalks transformation happened
  expect(result.current.talks[0]).toMatchObject({
    id: 'rec123',
    title: 'Advanced TypeScript',
    topics: ['typescript', 'advanced'],
    speakers: ['Jane Smith'],
    format: 'talk'
  });
});
```

## Benefits

- ✅ Tests survive refactoring
- ✅ Catch real integration bugs
- ✅ Higher confidence in changes
- ✅ Less test maintenance
- ✅ Closer to actual user experience

## Common Patterns

### Pattern 1: Testing Filter Combinations
```typescript
it('applies multiple filters simultaneously', async () => {
  const talks = [/* ... */];

  (useTalks as ReturnType<typeof vi.fn>).mockReturnValue({
    talks,
    loading: false,
    error: null
  });

  renderIntegration(<TalksList />, {
    initialParams: new URLSearchParams('rating=5&hasNotes=true&format=podcast')
  });

  // Real TalksFilter applies all filters
  await waitFor(() => {
    expect(screen.getByText('Matching talk')).toBeInTheDocument();
  });
});
```

### Pattern 2: Testing Navigation Flow
```typescript
it('preserves filters across navigation', () => {
  renderIntegration(
    <Routes>
      <Route path="/talks" element={<TalksList />} />
      <Route path="/talk/:id" element={<TalkDetail />} />
    </Routes>,
    {
      initialPath: '/talks',
      initialParams: new URLSearchParams('rating=5')
    }
  );

  // Navigate to detail
  fireEvent.click(screen.getByText('Some Talk'));

  // Verify filters preserved in URL
  expect(window.location.search).toContain('rating=5');
});
```

### Pattern 3: Testing with Real Utilities
```typescript
it('uses real hasMeaningfulNotes utility', () => {
  const talkWithNotes = createTalk({
    notes: 'Comprehensive notes'
  });

  renderIntegration(
    <TalkCard talk={talkWithNotes} {...handlers} />
  );

  // Real hasMeaningfulNotes determines icon visibility
  expect(screen.getByRole('img', { name: /detailed notes/i }))
    .toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Tests are slow
**Solution:** Use integration tests for critical paths only. Keep unit tests for fast feedback.

### Issue: Tests are flaky
**Solution:** Use `waitFor()` consistently. Ensure test timing is controlled with fast configs.

### Issue: Hard to debug failures
**Solution:** Use `screen.debug()` to see rendered output. Check that mocked data matches expected structure.

### Issue: Mock calls not working
**Solution:** You shouldn't be checking mock calls in integration tests. Verify user-visible behavior instead.

## Best Practices

1. **Start with a pilot** - Test one component integration before migrating all tests
2. **Keep existing tests** - Don't delete working unit tests until integration tests prove valuable
3. **Test behavior, not implementation** - Focus on what users see and do
4. **Mock at boundaries** - Only mock external services, not internal code
5. **Use real data** - Test with realistic data structures that match production

## Further Reading

- [Testing Library Best Practices](https://testing-library.com/docs/queries/about/#priority)
- [Kent Beck's Test Desiderata](https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3)
- [Integration Tests vs Unit Tests](https://martinfowler.com/bliki/IntegrationTest.html)
