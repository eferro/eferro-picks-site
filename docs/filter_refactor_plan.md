# Talks Filter Refactor Plan

This document tracks the TDD-driven refactor to centralize all filter logic in a single `TalksFilter` class.

## Main Goal

**Centralize all filtering logic, state, and URL parameter handling in the `TalksFilter` class, ensuring all filter-related code is robust, maintainable, and fully covered by tests.**

- All filter state (author, topics, conference, year, notes, rating, query) is now represented in `TalksFilter`.
- All filter handlers and UI state updates in components use `TalksFilter` and URL params exclusively.
- All tests are green and rely on `TalksFilter` for assertions and setup.

## Completed Tasks

1. [x] **Define requirements and API for `TalksFilter` class**
2. [x] **Write initial failing tests for parsing filter state from URL parameters**
3. [x] **Write initial failing tests for generating URL parameters from filter state**
4. [x] **Write initial failing tests for filtering a single talk and a list of talks**
5. [x] **Implement `TalksFilter` constructor and filter state fields**
6. [x] **Implement parsing from URL parameters (make tests pass)**
7. [x] **Implement URL parameter generation (make tests pass)**
8. [x] **Implement filtering logic (make tests pass)**
9. [x] **Refactor all usages to use `TalksFilter` for parsing, serialization, and filtering**
10. [x] **Ensure all tests pass after refactor**
11. [x] **Revert to clean, passing state after integration test issues**
12. [x] Remove duplicated author filter state and logic from TalksList, use TalksFilter exclusively for author filtering.  
    _Completed: Verified by passing tests and code review._
13. [x] Remove duplicated topic filter state and logic from TalksList, use TalksFilter exclusively for topic filtering.  
    _Completed: Verified by passing tests and code review._
14. [x] Remove duplicated conference filter state and logic from TalksList, use TalksFilter exclusively for conference filtering.  
    _Completed: Verified by passing tests and code review._
15. [x] Remove duplicated year filter state and logic from TalksList, use TalksFilter exclusively for year filtering.  
    _Completed: Verified by passing tests and code review._
16. [x] Remove duplicated notes and rating filter state and logic from TalksList, use TalksFilter exclusively for these filters.  
    _Completed: All filter logic is now centralized in TalksFilter and URL params._
17. [x] Ensure all filter handler functions update only via TalksFilter and URL params.  
    _Completed: All handlers now update state via TalksFilter and URL params only._
18. [x] Refactor tests to rely on TalksFilter for all filter assertions and state setup.  
    _Completed: All tests now use TalksFilter and URL params for setup and assertions; all tests pass._
20. [x] Final code cleanup and ensure all tests pass.  
    _Completed: All tests are green; codebase is ready for documentation and final cleanup._ 

---

## Pending Tasks

19. [x] **Clean up and document the new filter system in developer docs.**
    - _Completed: Comprehensive developer documentation for the centralized filter system has been added to this file._
    - Write clear developer documentation for the new filter system.
    - Provide usage examples for adding or extending filters.
    - Document best practices for maintaining and testing filter logic.
    - Ensure onboarding for new contributors is easy and the filter system is discoverable.

21. [x] **Centralize all year filter logic in TalksFilter.**
    - _Completed: All year filtering logic, including ranges and relative logic, is now fully centralized in TalksFilter and all tests pass._
    - Move year range and relative year logic from components into TalksFilter.
    - Ensure all year filtering is handled via the class and URL params.
    - Update components to use only TalksFilter for year filtering.
    - Add/adjust tests to cover year range and relative year scenarios via TalksFilter.

22. [x] **Refactor TalkDetail to use TalksFilter for all filter logic and param manipulation.**
    - _Completed: TalkDetail now uses TalksFilter for all filter state, handlers, and URL param updates. All tests pass._
    - Remove direct param manipulation from TalkDetail component.
    - Use TalksFilter for all filter state, updates, and URL param handling in TalkDetail.
    - Ensure TalkDetail UI and handlers are fully integrated with the centralized filter logic.
    - Update or add tests to verify TalkDetail uses TalksFilter exclusively.

---

**Status:**
- The main goal is achieved: all filtering logic is centralized, robust, and fully tested. The refactor is complete.

---

## Developer Documentation: Centralized Filter System

### 1. Overview

The `TalksFilter` class centralizes all filtering logic, state, and URL parameter handling for the talks application. This ensures that all filter-related code is robust, maintainable, and fully covered by tests. All filter state (author, topics, conference, year, notes, rating, query) should be represented in `TalksFilter`.

### 2. API Documentation

**Main Methods:**
- `constructor(fields)`: Initializes filter state.
- `static fromUrlParams(params: URLSearchParams)`: Parses filter state from URL params.
- `toParams(): URLSearchParams`: Serializes filter state to URL params.
- `filter(talks: Talk[]): Talk[]`: Returns a filtered list of talks.

**Example:**
```ts
const filter = TalksFilter.fromUrlParams(searchParams);
const filteredTalks = filter.filter(allTalks);
const newParams = filter.toParams();
```

### 3. Usage Examples

**Parsing filters from the URL:**
```ts
const filter = TalksFilter.fromUrlParams(searchParams);
```

**Updating filters and syncing with URL params:**
```ts
const nextFilter = filter.withUpdatedField('author', 'New Author');
setSearchParams(nextFilter.toParams());
```

**Filtering a list of talks:**
```ts
const visibleTalks = filter.filter(allTalks);
```

### 4. Extending the Filter System
- Add new fields to the `TalksFilter` class and its constructor.
- Update `fromUrlParams` and `toParams` to parse/serialize the new field.
- Update the `filter` method to apply the new filter logic.
- Add/extend tests in `TalksFilter.test.ts` for parsing, serialization, and filtering.

### 5. Best Practices
- Always use `TalksFilter` for any filter logic or state.
- Do not keep duplicated filter state in components.
- Use TDD for any changes or extensions.
- Keep filter logic simple and focused in the class.

### 6. Testing
- Use the test utilities to set up filter state in tests.
- Write tests for new filter fields covering parsing, serialization, and filtering.
- Ensure all tests pass after any change.

### 7. Migration Notes
- _All filter logic is now centralized in TalksFilter. No pending migrations remain._

---

For any new filter or change, follow the above guidelines to keep the system robust and maintainable. 