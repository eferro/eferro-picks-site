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

### Testing Requirements

1. **All new components must have tests**
2. **Use existing test utilities:**
   ```typescript
   import { renderWithRouter, createTalk } from '../../test/utils';
   ```
3. **Test filter interactions through TalksFilter:**
   ```typescript
   const filter = new TalksFilter({ author: 'John Doe' });
   expect(filter.filter(talks)).toHaveLength(expectedCount);
   ```
4. **Run tests with:** `npm test -- --run` (never use watch mode)

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

### Testing Patterns

```typescript
// ✅ GOOD: Test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks
    vi.clearAllMocks();
    setMockSearchParams(new URLSearchParams());
  });

  it('should handle filter updates correctly', () => {
    // Arrange
    const talks = [createTalk({ id: '1', author: 'Test Author' })];
    
    // Act
    renderWithRouter(<Component />);
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));
    
    // Assert
    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining({
        // Verify TalksFilter output
      })
    );
  });
});
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

## Common Pitfalls to Avoid

❌ **DON'T:**
- Manipulate URL parameters directly
- Create duplicate filter logic in components
- Skip writing tests
- Use any/unknown types without good reason
- Ignore TypeScript errors
- Use watch mode for tests in CI/development

✅ **DO:**
- Use TalksFilter for all filtering operations
- Write tests before implementation
- Use TypeScript interfaces for all data structures
- Handle loading/error states properly
- Follow the existing code patterns
- Run tests with `--run` flag

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
- Uses Vitest with jsdom environment
- React Testing Library for component testing
- Comprehensive mocking system for React Router
- Test utilities in `src/test/utils.tsx` for common patterns

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

### Testing Approach
- Write small, focused test cases
- Use existing test utilities and mocking patterns
- Test user interactions through proper event simulation
- Verify filter state changes through TalksFilter class
- Maintain or improve test coverage with each change

Remember: This codebase follows strict TDD principles and has a sophisticated centralized filtering system. Always respect these architectural decisions and maintain the high quality standards established in the existing code.