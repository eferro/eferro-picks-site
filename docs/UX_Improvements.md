# UX and Front‑End Improvements for eferro picks

This document lists prioritized usability/UX improvements for the **eferro picks** website, a curated collection of software-development talks and podcasts. Each improvement includes a rationale (what/why/expected benefit) and a structured task specification ready for an autonomous AI coding agent.

## 1. Fix the horizontal scroll and improve card responsiveness

**Why**: On desktop the talk cards overflow horizontally, causing a bottom scrollbar[[1]](https://eferro.github.io/eferro-picks-site/). On smaller screens this forces lateral scrolling.

**Benefit**: Removes unnecessary friction, improves readability on phones/tablets, and presents a more polished interface.

**Task for AI agent**:

Task Description:  
- Modify the talk-list page layout so that cards never cause a horizontal scrollbar.  
- Implement a responsive grid (CSS Grid/Flexbox) that adapts from 1 column on very small screens to 2–3 columns on tablets and 3–4 columns on larger screens.  
- Ensure tags wrap within the card instead of expanding its width.

Acceptance Criteria:  
- On desktops, no horizontal scrollbar is visible; cards wrap properly.  
- On tablet and mobile viewports (<=768px), cards stack into 1–2 columns and fill available space without overflow.  
- Long tag names wrap or truncate gracefully.  
- Verified via responsive mode or manual resizing.

Constraints:  
- Maintain existing color/typography.  
- Use vanilla CSS or the project’s existing styling system.

---

## 2. Add a “Format” indicator and filter (Talk vs Podcast)

**Why**: Users can’t distinguish between video talks and audio podcasts until they click through a card.

**Benefit**: Increases discoverability of preferred content types and saves users time.

**Task for AI agent**:

Task Description:  
- Extend the dataset model to include a `format` field (e.g., "talk", "podcast", "article").  
- Display a small icon or badge on each card denoting its format.  
- Add a “Format” filter (checkboxes for “Talks” and “Podcasts”) near existing filters.

Acceptance Criteria:  
- Each card shows its format via an icon or label.  
- A new “Format” filter appears beside “Filter by Year” and “Has Notes”.  
- Filtering by format updates the results count and shown cards.  
- URL parameters reflect the filter state.

Constraints:  
- Icons must be vector-based.  
- Filters must coexist with search and year filters.

---

## 3. Introduce topic/tag filtering via multi‑select chips

**Why**: The site lists many topics (e.g., *Engineering Culture, Teams, leadership*[[2]](https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK#:~:text=Engineering%20Culture%20Teams%20leadership)). Users currently must know the exact search syntax to filter by topic.

**Benefit**: Improves discoverability, reduces cognitive load, encourages exploration.

**Task for AI agent**:

Task Description:  
- Read all unique topics from the dataset.  
- Render these topics as selectable chips (or a multi‑select dropdown) near the existing filters.  
- When one or more topics are selected, filter the talk list to include only those whose topic tags intersect with the selected topics.  
- Provide a clear indicator for selected topics and allow clearing selections.

Acceptance Criteria:  
- The UI lists all topics (collapsed under a “Topics” filter until expanded).  
- Selecting a topic updates the “Showing X of Y talks” count and the talk list accordingly.  
- Selected topics are reflected in the URL query parameters.  
- Users can deselect topics individually or reset all topic filters.

Constraints:  
- The topics list must not overwhelm the page; use a scrollable container or search within topics.  
- Ensure keyboard navigation and high‑contrast selection states.

---

## 4. Add “Sort by” options (Year, Duration, Rating)

**Why**: Without sorting controls, users cannot easily see the newest, oldest or shortest talks.

**Benefit**: Helps users prioritize content (e.g., newest or shorter sessions) and increases engagement.

**Task for AI agent**:

Task Description:  
- Implement a “Sort by” dropdown next to the existing filters. Options: Newest to Oldest, Oldest to Newest, Shortest Duration, Longest Duration, Highest Rated.  
- Re‑order the talk cards within each category based on the selected option.  
- Persist the selected sort order in URL parameters.

Acceptance Criteria:  
- Dropdown displays sort options and reflects the current selection.  
- Changing the sort order updates the card ordering without reloading the page.  
- Sorting works together with existing filters and search.  
- URL includes a `sort` parameter for bookmarking.

Constraints:  
- Sorting should not break category grouping (unless global sort is allowed).  
- Use existing JavaScript frameworks/libraries already in the project; avoid heavy dependencies.

---

## 5. Collapse/expand category sections and add a “Back to top” anchor

**Why**: The landing page lists many categories, requiring long scrolling[[1]](https://eferro.github.io/eferro-picks-site/).

**Benefit**: Reduces scrolling fatigue and keeps the page manageable.

**Task for AI agent**:

Task Description:  
- Wrap each category section (e.g., “Engineering Culture (41)”) in an HTML `<details>` element or a custom accordion.  
- Render the section heading as a clickable control that toggles expansion.  
- Add a floating “Back to Top” button that appears after scrolling down and scrolls smoothly to the page top when clicked.

Acceptance Criteria:  
- By default, only the first few categories are expanded; others are collapsed.  
- Clicking a category heading toggles its cards without a page reload.  
- The Back to Top button appears only when scrolled down and disappears near the top.  
- Smooth scrolling is accessible via keyboard and screen readers.

Constraints:  
- Do not hide content from search engines; collapsed sections must remain in the DOM.  
- Back to Top must not obscure content on small screens.

---

## 6. Improve search usability with auto‑suggest and clear syntax hints

**Why**: The search bar uses advanced syntax (e.g., author:Kent Beck topic:XP), which may confuse new users[[3]](https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK#:~:text=Engineering%20Culture%20).

**Benefit**: Faster and more accurate searches; users quickly find authors, titles or topics without remembering syntax.

**Task for AI agent**:

Task Description:  
- Enhance the search input to show suggestions as the user types (author names, talk titles, and topics).  
- Highlight the portion of the suggestion that matches the user’s input.  
- Allow selection via click or arrow keys, populating the search field.  
- Add an inline help tooltip near the search box explaining the search syntax.

Acceptance Criteria:  
- Typing displays a dropdown of up to 5–10 suggestions based on existing data.  
- Selecting a suggestion updates the search results immediately.  
- A small “?” icon or tooltip explains search operators.  
- Pressing “Enter” without selecting still performs a search.

Constraints:  
- Suggestion logic must run client‑side and not call external APIs.  
- Use debouncing to prevent performance issues.  
- Keep the UI lightweight; avoid heavy typeahead libraries if custom code suffices.

---

## 7. Enable bookmarking/favorites using local storage

**Why**: Users may want to curate a personal list of talks to watch later.

**Benefit**: Personalization increases engagement and makes it easier to return to saved talks.

**Task for AI agent**:

Task Description:  
- Add a “Save” or “Favorite” icon on each card. Clicking toggles its saved state.  
- Store favorites in browser localStorage keyed by talk ID.  
- Provide a “Favorites” filter/button near existing filters to show only saved items when active.  
- Persist the saved state across sessions.

Acceptance Criteria:  
- Clicking the favorite icon toggles between saved/unsaved states with visual feedback.  
- Favorites persist after page refresh.  
- Activating the “Favorites” filter shows only saved cards.  
- Favorites integrate correctly with other filters (year, topics).

Constraints:  
- Favorites storage remains client‑side only.  
- Ensure accessibility (keyboard‑focusable icons with aria‑labels).

---

## 8. Improve visual hierarchy on talk detail pages

**Why**: Talk pages contain long lists and bullet points[[4]](https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK). Better typography and spacing improve readability.

**Benefit**: Faster comprehension of key notes and easier decision‑making on whether to watch a talk.

**Task for AI agent**:

Task Description:  
- Adjust CSS on talk detail pages to establish clearer hierarchy: larger titles/headings, increased spacing between bullets, proper indentation for sub‑lists.  
- Optionally add a subtle background color or border around the “Key Notes” section.  
- Separate the bottom “Core Topic/Topics” area with spacing or a border.

Acceptance Criteria:  
- Talk title stands out compared to body text.  
- Bullet lists are easy to scan; nested bullets are indented correctly.  
- The “Key Notes” section is visually distinct.  
- Bottom tags are clearly separated.  
- No text overlaps or truncates across browsers.

Constraints:  
- Stay within the existing color palette and typography.  
- Use CSS only; avoid altering HTML structure unless necessary.

---

## 9. Provide quick links/navigation to categories

**Why**: The list is long and categories are spread out. A category index allows users to jump directly to a section.

**Benefit**: Faster navigation and improved orientation for users seeking specific topics.

**Task for AI agent**:

Task Description:  
- Generate a list of category names and counts from the dataset.  
- Render this list at the top of the page or in a sticky sidebar.  
- Each category name is a link that scrolls smoothly to its section using anchor IDs or intersection observers.  
- Highlight the active category as the user scrolls.

Acceptance Criteria:  
- The category index appears on wide screens and is toggleable on mobile.  
- Clicking a category jumps to its section with smooth scroll.  
- The active category in the index is highlighted during scrolling.  
- Navigation does not overlap content and is collapsible on small screens.

Constraints:  
- Use anchor links within the same page (no external routing).  
- Progressive enhancement: the page remains usable without JavaScript (anchor links degrade gracefully).

---

These improvements prioritize high‑impact changes that offer better navigation, discoverability and personalization while keeping implementation complexity manageable. They are intended to be used by an autonomous AI coding agent to update the **eferro picks** site.

---

[[1]](https://eferro.github.io/eferro-picks-site/) eferro's picks - Curated Software Development Talks

[https://eferro.github.io/eferro-picks-site/](https://eferro.github.io/eferro-picks-site/)

[[2]](https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK#:~:text=Engineering%20Culture%20Teams%20leadership) [[3]](https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK#:~:text=Engineering%20Culture%20) [[4\]](https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK) eferro's picks \- Curated Software Development Talks

[https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK](https://eferro.github.io/eferro-picks-site/talk/recKVdulRpgPVbaLK)