<!--
This document lists pending improvements and ideas for the Picks site.
Feel free to add or remove entries as the project evolves.
-->
# Pending Improvements and Ideas

## 1. Author Filter Enhancements
- [ ] Initial load with `?author=` param should pre-select the author and filter talks.
- [ ] Test interaction of author filter with other filters (topics, rating, hasNotes).
- [ ] UI: add an “All authors” or “Clear author” control to reset author filter.
- [ ] Accessibility: use `aria-pressed` on author buttons for better screen-reader support.

## 2. Combined Filters Behavior
- [ ] Define and document the expected behavior when multiple filters are active.
- [ ] Add end-to-end tests for multi-filter combinations (author + topic, hasNotes + rating, etc.).

## 3. UI & UX Improvements
- [ ] Move filter controls into a collapsible sidebar on desktop for easier access.
- [ ] Add a “Reset all filters” button.
- [ ] Persist filter state across sessions (e.g. using localStorage).
- [ ] Show a badge or count on active filters.

## 4. Performance & Scalability
- [ ] Implement pagination or infinite scroll for large talk lists.
- [ ] Debounce filter changes to avoid excessive navigations or renders.
- [ ] Lazy-load talk cards and images.

## 5. Code Refactoring
- [ ] Extract common filter-URL sync logic into a custom hook (`useUrlFilter`).
- [ ] Consolidate repeated URL param handling across components.
- [ ] Improve type-safety (e.g. union types for filter keys).

## 6. Testing
- [ ] Add integration tests (Cypress or Playwright) to cover full filter flows.
- [ ] Include snapshot tests for filter UI components.
- [ ] Test edge-cases: empty state, error state, loading state.
- [ ] Add code coverage measurement for untested branches.

## 7. Documentation
- [ ] Update README to list all available filter query parameters and their semantics.
- [ ] Provide a developer guide for adding new filters.

## 8. Miscellaneous
- [ ] Add support for conference filtering in the URL (if not covered).
- [ ] Internationalization (i18n) of UI labels.
- [ ] Optimize SEO by updating meta tags based on active filters.

*Last updated: YYYY-MM-DD*