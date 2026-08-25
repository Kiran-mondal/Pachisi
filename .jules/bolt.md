## 2024-08-24 - Unused Penpot API Integration
**Learning:** The codebase contained an unused Penpot API integration (`fetchPenpotDesign`) that executed an HTTP request on every page load but only logged the result to the console. This is an anti-pattern that slows down page load and wastes network/compute resources.
**Action:** When inspecting front-end files, check for API calls that trigger on startup (e.g. in `DOMContentLoaded`) but are not actually used to update the UI or app state.
## 2026-08-25 - DOM Manipulation Bottlenecks in Vanilla Games
**Learning:** In vanilla JavaScript games with frequent UI updates (like token movements or turn switches), querying the entire DOM using `querySelectorAll` for class toggles, or using attribute selectors (`[data-id=...]`) for lookups, can cause micro-stutters.
**Action:** Use `DocumentFragment` for batched board generation, inject `id` attributes to allow O(1) `getElementById` lookups instead of attribute queries, and narrow `querySelectorAll` to only target elements that currently have the state class (e.g., `.token.playable`).
