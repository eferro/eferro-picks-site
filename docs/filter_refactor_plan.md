# Talks Filter Refactor Plan

This document tracks the TDD-driven refactor to centralize all filter logic in a single `TalksFilter` class.

## Tasks

1. [x] **Define requirements and API for `TalksFilter` class**
2. [x] **Write initial failing tests for parsing filter state from URL parameters**
3. [x] **Write initial failing tests for generating URL parameters from filter state**
4. [x] **Write initial failing tests for filtering a single talk and a list of talks**
5. [x] **Implement `TalksFilter` constructor and filter state fields**
6. [x] **Implement parsing from URL parameters (make tests pass)**
7. [x] **Implement generating URL parameters (make tests pass)**
8. [x] **Implement filtering logic for a single talk (make tests pass)**
9. [x] **Implement filtering logic for a list of talks (make tests pass)**
10. [x] **Add tests for edge cases and combinations of filters**
11. [x] **Refactor UI code to use `TalksFilter` for all filter state and logic** _(TalksFilter class and tests are now fully implemented and passing. All filter parameter parsing, URL generation, and filtering logic is centralized and tested.)_
12. [ ] **Remove old, duplicated filter logic from components**
13. [ ] **Document the new filter system and update developer docs** 