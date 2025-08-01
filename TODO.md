<!--
This document lists pending improvements and ideas for the Picks site.
Feel free to add or remove entries as the project evolves.
-->
# Pending Improvements and Ideas

## User-facing improvements
- [ ] search bar to look for topics or speakers
- [ ] the default page should show in the url the default filters

## Accidental Complexity & Smells
- [x] create a `useUrlFilter` hook to consolidate filter updates and URL param
      merging logic across components
- [ ] refactor tests to share common search param setup helpers and reduce
      verbose mocking
- [ ] fix ESLint configuration by adding the missing `typescript-eslint` package
      so `npm run lint` executes successfully
