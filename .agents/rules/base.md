# AI Development Rules for eferro-picks-site

## Project Overview

This is **eferro's picks** - a curated collection of software development talks built with React + TypeScript. The application features a sophisticated filtering system, comprehensive testing, and automated data synchronization from Airtable.

**Key Technologies:**
- React 18 + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Vitest + Testing Library for testing
- Airtable for data management
- GitHub Pages for deployment

## Architecture Principles

### 1. Centralized Filter System
- **ALL filtering logic** must go through the `TalksFilter` class (`src/utils/TalksFilter.ts`)
- Components should **NEVER** manipulate URL parameters directly
- Filter state is derived from URL parameters via `TalksFilter.fromUrlParams()`
- Filter updates use `TalksFilter` instances and `toParams()` method

### 2. Test-Driven Development (TDD)
- **Always write tests first** before implementing features
- Use small, focused test cases that verify one behavior at a time
- All components and utilities must have corresponding test files
- Tests should use the existing test utilities in `src/test/utils.tsx`

### 3. Component Structure
- Components are organized by feature in `src/components/`
- Each component should have its own directory with `index.tsx` and tests
- Use TypeScript interfaces for all props and data structures
- Follow React best practices with hooks and functional components

## Development Guidelines

### Code Quality & Type Safety

**Complete Type Safety Requirements:**
- **NEVER use `any` types** - always use proper TypeScript interfaces
- Use `unknown` for truly unknown data, `never` for impossible cases
- Replace `any` with specific interfaces: `MockTalkCardProps`, `ReturnType<typeof vi.fn>`, etc.
- Test mocks should use proper typing: `(mockFn as ReturnType<typeof vi.fn>).mockImplementation`

**Dependencies Management:**
- Keep all linting dependencies up to date (`typescript-eslint`, `globals`, `@eslint/js`)
- Run `npm audit` regularly and fix security vulnerabilities
- Ensure ESLint configuration is compatible with installed packages

### Language and Communication

**CRITICAL: All project artifacts must be in English:**
- **Code**: Variables, functions, classes, interfaces, types, comments
- **Commits**: All commit messages and descriptions
- **Documentation**: README files, inline comments, API docs
- **Tests**: Test descriptions, assertions, test data
- **User-facing content**: UI text, error messages, labels
- **Configuration**: Config files, environment variables

**This applies regardless of the language used in conversations with AI assistants or team members.** The codebase is international and English ensures maximum accessibility and collaboration.

### Code Style & Patterns

```typescript
// ✅ GOOD: Use TalksFilter for all filtering
const filter = TalksFilter.fromUrlParams(searchParams);
const filteredTalks = filter.filter(talks);

// ❌ BAD: Direct URL parameter manipulation
const author = searchParams.get('author');
setSearchParams(prev => ({ ...prev, author: newAuthor }));

// ✅ GOOD: Update filters through TalksFilter
const nextFilter = new TalksFilter({ ...filter, author: newAuthor });
setSearchParams(nextFilter.toParams());
```

### Testing Requirements (Test Desiderata Compliant)

**MANDATORY TDD Workflow:**
1. **Write failing tests FIRST** - no exceptions
2. **Implement minimal code** to make tests pass
3. **Refactor** while keeping tests green
4. **All new components must have tests** covering all interaction patterns

**Required Test Utilities (ALWAYS use centralized utilities):**
```typescript
// From src/test/utils.tsx - NEVER mock React Router directly
import {
  renderWithRouter,     // For components using React Router
  createTalk,          // For consistent test data generation
  mockNavigate,        // For navigation testing
  setMockSearchParams, // For URL parameter testing
  createMockHandlers   // For event handler testing
} from '../../test/utils';
```

**Filter System Testing (PROJECT-CRITICAL):**
```typescript
// ✅ CORRECT - Use TalksFilter for all filtering logic
const filter = new TalksFilter({ author: 'John Doe' });
const filteredTalks = filter.filter(talks);
expect(filteredTalks).toHaveLength(expectedCount);

// Test URL parameter conversion
const nextFilter = new TalksFilter({ ...filter, query: 'react' });
setSearchParams(nextFilter.toParams());
```

**Performance & Isolation Standards:**
- **Run tests with:** `npm test -- --run` (NEVER use watch mode)
- **happy-dom environment** provides 3x faster performance than jsdom
- **Cached mocks** reduce test overhead
- **Deterministic time** using `vi.useFakeTimers()` for date-dependent tests

### File Organization

```
src/
├── components/          # React components
│   ├── ComponentName/
│   │   ├── index.tsx   # Main component
│   │   └── ComponentName.test.tsx
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and classes
│   ├── TalksFilter.ts  # CENTRAL filter logic
│   └── TalksFilter.test.ts
└── test/               # Test utilities and setup
```

## Specific Rules for AI Assistants

### When Working with Filters

1. **NEVER bypass TalksFilter** - All filter logic must use the centralized class
2. **Always update URL params via TalksFilter.toParams()**
3. **Parse URL params only via TalksFilter.fromUrlParams()**
4. **Preserve extra URL parameters** when updating filters

### When Adding New Features

1. **Write failing tests first** (TDD approach)
2. **Implement minimal code** to make tests pass
3. **Refactor only after tests are green**
4. **Run all tests** after each change: `npm test -- --run`
5. **Commit frequently** with descriptive messages

### Pre-Commit Validation Protocol

**MANDATORY: Before any `git commit`, AI assistants MUST:**

1. **🧪 Test Validation**
   ```bash
   npm test -- --run
   ```
   - Ensure ALL tests pass (0 failures)
   - Verify no test regressions

2. **🔍 Linting Validation**
   ```bash
   npm run lint
   ```
   - Ensure 0 errors, 0 warnings
   - Maintain 100% clean code quality

3. **📝 Type Check** (when relevant)
   ```bash
   npx tsc --noEmit
   ```
   - Verify TypeScript compilation
   - Catch type errors early

**Only commit after ALL validations pass.** This maintains our high-quality, deployable codebase.

### When Refactoring

1. **Maintain test coverage** - never reduce test coverage
2. **Update tests to match new implementation** patterns
3. **Ensure all existing tests still pass**
4. **Document any breaking changes** in commit messages

### Component Development

```typescript
// ✅ GOOD: Component structure
interface ComponentProps {
  // Explicit prop types
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Use hooks for state management
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = useMemo(() => 
    TalksFilter.fromUrlParams(searchParams), 
    [searchParams.toString()]
  );
  
  // Event handlers update via TalksFilter
  const handleFilterChange = (newValue: string) => {
    const nextFilter = new TalksFilter({ ...filter, field: newValue });
    setSearchParams(nextFilter.toParams());
  };
  
  return (
    // JSX with proper accessibility
    <div role="main" aria-label="Component description">
      {/* Content */}
    </div>
  );
}
```

### Comprehensive Testing Patterns (Test Desiderata Framework)

**Required Test Structure:**
```typescript
// ✅ EXCELLENT: Complete test structure following Test Desiderata
describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());
    // DON'T recreate expensive objects - they're cached for performance
  });

  describe('Rendering', () => {
    it('renders core functionality with proper semantics', () => {
      // Test basic component output and accessibility
    });
  });

  describe('Interactions', () => {
    it('handles user events with proper event propagation', () => {
      // Test click, keyboard, form interactions
      // Verify stopPropagation where needed
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes and semantic roles', () => {
      // MANDATORY for all interactive components
      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Talk: Test Talk');
    });
  });

  describe('Filter Integration', () => {
    it('integrates correctly with TalksFilter system', () => {
      // Test TalksFilter usage - PROJECT CRITICAL
      const filter = new TalksFilter({ author: 'Test Author' });
      // Verify filter behavior
    });
  });

  describe('Error Handling', () => {
    it('handles edge cases and invalid states gracefully', () => {
      // Test null/undefined, empty states, network errors
    });
  });
});
```

**Behavioral Testing Focus (Structure-Insensitive):**
```typescript
// ✅ EXCELLENT: Test user behavior, not implementation
it('navigates to talk detail when card is clicked', () => {
  const talk = createTalk({ id: 'test-id' });
  setMockSearchParams(new URLSearchParams('topics=test'));
  renderTalkCard({ talk });

  const card = screen.getByRole('article', { name: /Talk: Test Talk/i });
  fireEvent.click(card);

  expect(mockNavigate).toHaveBeenCalledWith({
    pathname: `/talk/test-id`,
    search: 'topics=test'
  });
});

// ❌ BAD: Testing implementation details
it('calls internal helper function', () => {
  // DON'T test private methods or internal state
});
```

**Mutation Testing Patterns (Predictive & Specific):**
```typescript
describe('arithmetic operator mutation detection', () => {
  it('should verify division operations with non-identity values', () => {
    // These values catch * vs / mutations
    expect(formatDuration(7260)).toBe('2h 1m'); // 7260/3600=2.01h vs 7260*3600=huge
    expect(formatDuration(180)).toBe('3m');     // 180/60=3m vs 180*60=huge
  });

  it('should verify boundary conditions catch comparison mutations', () => {
    expect(formatDuration(59)).toBe('59s');    // Just under 1 minute
    expect(formatDuration(60)).toBe('1m');     // Exactly 1 minute (> vs >= mutations)
    expect(formatDuration(3599)).toBe('59m');  // Just under 1 hour
    expect(formatDuration(3600)).toBe('1h 0m'); // Exactly 1 hour
  });
});
```

## Test Desiderata Excellence (12/12 Properties)

This project achieves **exceptional Test Desiderata compliance** across all 12 properties:

| Property | Status | Implementation |
|----------|---------|---------------|
| **Isolated** ✅ | Excellent | Proper cleanup, cached mocks, no shared state |
| **Composable** ✅ | Excellent | Reusable utilities (`createTalk`, `renderWithRouter`) |
| **Deterministic** ✅ | Excellent | Mocked time, consistent test data, no randomness |
| **Fast** ✅ | Outstanding | happy-dom (3x faster), cached utilities, optimized config |
| **Writable** ✅ | Excellent | Low-friction utilities, clear patterns, minimal boilerplate |
| **Readable** ✅ | Excellent | Descriptive names, Arrange-Act-Assert structure |
| **Behavioral** ✅ | Excellent | Focus on user interactions, not implementation details |
| **Structure-insensitive** ✅ | Excellent | Public API testing, refactor-safe |
| **Automated** ✅ | Perfect | Zero manual verification steps |
| **Specific** ✅ | Excellent | Focused assertions, clear failure points |
| **Predictive** ✅ | Excellent | Comprehensive edge cases, mutation testing |
| **Inspiring** ✅ | Excellent | Tests reflect real usage patterns, high confidence |

### Performance Optimization Strategies

**Test Speed Optimizations (Fast Property):**
- **happy-dom environment**: 3x faster than jsdom
- **Cached test utilities**: Avoid recreation overhead
- **Single fork testing**: Optimized for CI/local development
- **CSS processing disabled**: Major speed improvement for tests
- **Dependency optimization**: Pre-optimized test libraries

**Isolation & Determinism:**
```typescript
// Deterministic date handling
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-01'));
// test logic
vi.useRealTimers();

// Proper cleanup maintaining isolation
beforeEach(() => {
  vi.clearAllMocks();                           // Reset behavior
  setMockSearchParams(new URLSearchParams());   // Reset URL state
  // DON'T recreate cached objects for performance
});
```

### Centralized Test Utilities Reference

**Available in `src/test/utils.tsx` (ALWAYS use these):**

```typescript
// Router Testing
renderWithRouter(component)     // Renders with BrowserRouter context
mockNavigate                   // Mock function for navigation testing
setMockSearchParams(params)    // Set URL parameters for tests
getMockSearchParams()          // Get current mock URL parameters

// Data Generation
createTalk(overrides?)         // Generate consistent test talk data
createMockHandlers(overrides?) // Generate mock event handlers

// Component Testing
renderTalkCard(props?)         // Specialized TalkCard renderer
renderWithoutRouter(component) // For components not using router

// Performance Utilities
validateComponentProps(Component, props) // Fast prop validation without DOM
```

**Test Setup Utilities:**
```typescript
// From src/test/setup.ts - automatically configured
// - window.location mocking for happy-dom compatibility
// - Cached talks.json data loading
// - Global fetch mocking with performance optimization
// - matchMedia, IntersectionObserver, ResizeObserver mocks
```

### Test Data Patterns

**Consistent Test Data:**
```typescript
// ✅ GOOD: Use createTalk with specific overrides
const talk = createTalk({
  id: 'test-specific-id',
  title: 'Test Talk Title',
  speakers: ['Test Speaker'],
  topics: ['test-topic'],
  year: 2024
});

// ✅ GOOD: Multiple talks with variations
const talks = [
  createTalk({ id: '1', author: 'Alice', topics: ['react'] }),
  createTalk({ id: '2', author: 'Bob', topics: ['javascript'] }),
  createTalk({ id: '3', author: 'Carol', topics: ['typescript'] })
];
```

**Mock Handler Patterns:**
```typescript
// ✅ EXCELLENT: Typed mock handlers
const mockHandlers = createMockHandlers({
  onTopicClick: vi.fn<[string], void>(),
  onConferenceClick: vi.fn<[string], void>()
});

// Test interaction
fireEvent.click(screen.getByRole('button', { name: /filter by topic/i }));
expect(mockHandlers.onTopicClick).toHaveBeenCalledWith('expected-topic');
```

## Data Flow Patterns

### URL Parameter Handling
```typescript
// ✅ CORRECT: Centralized filter state
const [searchParams, setSearchParams] = useSearchParams();
const filter = useMemo(() => 
  TalksFilter.fromUrlParams(searchParams), 
  [searchParams.toString()]
);

// Update filters
const nextFilter = new TalksFilter({ ...filter, newField: value });
setSearchParams(nextFilter.toParams());
```

### Component State Management
- **Derive state from URL parameters** via TalksFilter
- **Use useMemo for expensive computations** like filtering
- **Minimize local component state** - prefer URL-driven state

## Error Handling

1. **Always handle loading and error states** in components
2. **Use TypeScript strict mode** - handle null/undefined cases
3. **Provide meaningful error messages** to users
4. **Test error scenarios** in unit tests

## Performance Guidelines

1. **Use useMemo for expensive calculations** (especially filtering)
2. **Optimize re-renders** with proper dependency arrays
3. **Lazy load components** where appropriate
4. **Test performance** with large datasets

## Accessibility Requirements

1. **Use semantic HTML** elements
2. **Provide ARIA labels** for interactive elements
3. **Ensure keyboard navigation** works properly
4. **Test with screen readers** in mind
5. **Maintain color contrast** requirements

## Critical Anti-Patterns to Avoid

### ❌ Testing Anti-Patterns (NEVER DO THIS):
```typescript
// DON'T: Direct router mocking in individual tests
vi.mock('react-router-dom', () => ({ /* ... */ }));

// DON'T: Test implementation details
expect(component.state.internalValue).toBe(expected);

// DON'T: Async code without proper waiting
fireEvent.click(button);
expect(result).toBe(expected); // Race condition!

// DON'T: Use any types in tests
const mockFn = vi.fn() as any;

// DON'T: Skip cleanup (breaks isolation)
// (missing beforeEach cleanup)

// DON'T: Generic test descriptions
it('should work', () => { /* ... */ });
```

### ✅ Correct Testing Patterns (ALWAYS DO THIS):
```typescript
// DO: Use centralized utilities
import { renderWithRouter, mockNavigate } from '../../test/utils';

// DO: Test public behavior
expect(screen.getByText('Expected Output')).toBeInTheDocument();

// DO: Proper async handling
fireEvent.click(button);
await waitFor(() => expect(result).toBe(expected));

// DO: Typed mocks
const mockFn = vi.fn<[string], void>();

// DO: Proper cleanup (maintains isolation)
beforeEach(() => {
  vi.clearAllMocks();
  setMockSearchParams(new URLSearchParams());
});

// DO: Descriptive test names
it('should navigate to talk detail when Enter key is pressed', () => {
```

### ❌ General Development Anti-Patterns:
- Manipulate URL parameters directly (bypass TalksFilter)
- Create duplicate filter logic in components
- Skip writing tests (breaks TDD workflow)
- Use any/unknown types without good reason
- Ignore TypeScript errors
- Use watch mode for tests in CI/development
- Test implementation details instead of behavior
- Skip accessibility testing

### ✅ Required Development Patterns:
- Use TalksFilter for ALL filtering operations
- Write tests BEFORE implementation (TDD)
- Use TypeScript interfaces for all data structures
- Handle loading/error states properly
- Follow established code patterns consistently
- Run tests with `--run` flag (performance + consistency)
- Test user behavior, not internal implementation
- Include accessibility testing for all interactive components

## Development Workflow

1. **Understand the requirement** - read existing code and tests
2. **Write failing tests** that describe the desired behavior
3. **Implement minimal code** to make tests pass
4. **Refactor if needed** while keeping tests green
5. **Run full test suite** to ensure no regressions
6. **Commit changes** with descriptive messages

## Systematic Code Quality Improvement

### When Addressing Linting Issues

**Follow this methodical approach:**

1. **📊 Categorize Issues**
   - React Hooks dependency warnings (highest priority - can cause bugs)
   - TypeScript `any` types (medium priority - affects maintainability)  
   - Style/formatting issues (lowest priority)

2. **🔧 Fix Systematically**
   - Address highest priority issues first
   - Use `useCallback` for React Hooks dependency fixes
   - Replace `any` with proper interfaces progressively
   - Test after each category of fixes

3. **✅ Validate Continuously**
   - Run tests after each major change
   - Maintain 100% passing tests throughout cleanup
   - Never compromise test coverage for code quality fixes

## Quick Reference Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run lint               # Run ESLint

# Testing (ALWAYS use --run flag)
npm test -- --run          # Run all tests
npm run test:coverage      # Run with coverage
npm run test:ui            # Visual test interface

# Type checking
npx tsc --noEmit          # Check TypeScript without building
```

## Project-Specific Context

### Data Structure
- Talks are fetched from Airtable and stored as JSON
- Each talk has: id, title, url, speakers, topics, description, core_topic, notes, year, conference_name
- The `Talk` interface is defined in `src/types/talks.ts`

### Filter Types Supported
- **Author/Speaker**: Filter by talk speaker names
- **Topics**: Multi-select topic filtering
- **Conference**: Filter by conference name
- **Year**: Complex year filtering (specific, before, after, last2, last5)
- **Has Notes**: Filter talks that have meaningful notes
- **Rating**: Filter by 5-star rating
- **Query**: Text search in talk titles

### Key Components
- `TalksList`: Main list view with all filters
- `TalkDetail`: Individual talk detail page
- `TalkCard`: Individual talk display component
- `YearFilter`: Complex year filtering dropdown
- `TalksFilter`: Central filtering logic class

### Testing Setup
- Uses Vitest with **happy-dom** environment (3x faster than jsdom)
- React Testing Library for component testing
- Comprehensive mocking system for React Router
- Test utilities in `src/test/utils.tsx` for common patterns
- **Exceptional Test Desiderata score (12/12)** - all properties optimized

## AI Agent Guidelines

### General Behavior
- Always respect the established architectural decisions
- Follow strict TDD principles - tests first, then implementation
- Maintain high code quality standards
- Use the centralized filtering system consistently
- Preserve existing patterns and conventions

### Code Generation
- Generate TypeScript interfaces for all data structures
- Include proper error handling and loading states
- Write comprehensive tests for all new functionality
- Follow established naming conventions and file organization
- Ensure accessibility compliance in all UI components

### Testing Approach (Test Desiderata Framework)

**Required Test Categories for ALL Components:**
1. **Rendering Tests** - Basic component output and accessibility
2. **Interaction Tests** - User events (click, keyboard, form submission)
3. **Accessibility Tests** - ARIA attributes, semantic roles, keyboard navigation
4. **Filter Integration Tests** - TalksFilter system integration (PROJECT-CRITICAL)
5. **Error Handling Tests** - Edge cases, loading states, error boundaries

**Test Writing Principles:**
- **Behavioral Focus**: Test what users see and do, not implementation details
- **Small & Focused**: One test per behavior, clear failure points
- **Mutation Testing**: Include edge cases that catch arithmetic/logic mutations
- **Performance Conscious**: Use cached utilities, avoid unnecessary object creation
- **Accessibility First**: Every interactive component must have accessibility tests

**Test Utilities Usage (MANDATORY):**
- Use existing test utilities and mocking patterns from `src/test/utils.tsx`
- Test user interactions through proper event simulation with `fireEvent`
- Verify filter state changes through TalksFilter class (NEVER bypass)
- Maintain or improve test coverage with each change
- Use `await waitFor()` for async operations, never bare assertions

## Advanced Testing Patterns

### Hook Testing (Custom React Hooks)
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { TestProvider } from '../test/context/TestContext';

describe('useCustomHook', () => {
  it('handles async operations with proper error handling', async () => {
    const { result } = renderHook(() => useCustomHook(), {
      wrapper: TestProvider  // Provides Router and other context
    });

    // Test loading state
    expect(result.current.loading).toBe(true);

    // Wait for async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    // Test final state
    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('maintains stable references when dependencies do not change', () => {
    const { result, rerender } = renderHook(() => useCustomHook());

    const firstResult = result.current.handler;
    rerender(); // Re-render with same dependencies
    const secondResult = result.current.handler;

    // Verify memoization works correctly
    expect(firstResult).toBe(secondResult);
  });
});
```

### Integration Testing Patterns
```typescript
describe('Component Integration', () => {
  it('integrates properly with filter system and navigation', async () => {
    const talks = [createTalk({ id: 'test-1', author: 'Kent Beck' })];

    renderWithRouter(<TalksList />);

    // Test filter integration
    const searchBox = screen.getByRole('textbox');
    fireEvent.change(searchBox, { target: { value: 'Kent Beck' } });
    fireEvent.keyDown(searchBox, { key: 'Enter' });

    // Verify URL parameters updated via TalksFilter
    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'Kent Beck'
        })
      );
    });
  });
});
```

### Error Boundary Testing
```typescript
describe('Error Handling', () => {
  it('handles component errors gracefully', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowError = () => {
      throw new Error('Test error');
    };

    renderWithRouter(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles network errors with retry logic', async () => {
    mockFetchError(new Error('Network error'));

    const { result } = await renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Verify error handling and retry behavior
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Network error');
    expect(global.fetch).toHaveBeenCalledTimes(3); // Verify retry attempts
  });
});
```

## Quality Assurance Standards

### Test Coverage Requirements
- **Minimum 90% coverage** for all new code
- **100% coverage** for critical filter logic and utilities
- **Accessibility coverage** for all interactive components
- **Error scenario coverage** for all async operations

### Performance Benchmarks
- **Tests must complete in < 30 seconds** for full suite
- **Individual test files < 5 seconds** maximum
- **No test should take > 1 second** unless testing async operations
- **Memory usage optimization** through cached utilities

### Code Quality Gates
Before any commit, verify:
1. ✅ All tests pass (`npm test -- --run`)
2. ✅ Linting clean (`npm run lint`)
3. ✅ Type checking passes (`npx tsc --noEmit`)
4. ✅ Test coverage maintained or improved
5. ✅ Accessibility tests included for UI changes
6. ✅ TDD workflow followed (tests written first)

Remember: This codebase follows strict TDD principles with **exceptional Test Desiderata compliance (12/12)** and has a sophisticated centralized filtering system. The testing approach is optimized for speed, reliability, and maintainability. Always respect these architectural decisions and maintain the high quality standards established in the existing code.