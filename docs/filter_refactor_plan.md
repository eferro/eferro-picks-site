# Talks Filter Refactor Plan

This document tracks the TDD-driven refactor to centralize all filter logic in a single `TalksFilter` class.

## Tasks

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

---

**Next steps:**
- Proceed in smaller, test-driven increments, applying learnings from previous iterations.
- After each change, if the tests pass, commit the changes.
- Continue with the remaining refactor and cleanup tasks as planned.

## Upcoming Tasks

12. [ ] Remove duplicated author filter state and logic from TalksList, use TalksFilter exclusively for author filtering.
13. [ ] Remove duplicated topic filter state and logic from TalksList, use TalksFilter exclusively for topic filtering.
14. [ ] Remove duplicated conference filter state and logic from TalksList, use TalksFilter exclusively for conference filtering.
15. [ ] Remove duplicated year filter state and logic from TalksList, use TalksFilter exclusively for year filtering.
16. [ ] Remove duplicated notes and rating filter state and logic from TalksList, use TalksFilter exclusively for these filters.
17. [ ] Ensure all filter handler functions update only via TalksFilter and URL params.
18. [ ] Refactor tests to rely on TalksFilter for all filter assertions and state setup.
19. [ ] Clean up and document the new filter system in developer docs.
20. [ ] Final code cleanup and ensure all tests pass. 