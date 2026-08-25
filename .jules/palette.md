## 2024-10-24 - Missing Form Associations in Custom Game Setup UIs
**Learning:** Custom UI configurations for games often use generic `div` elements for labels next to `select` dropdowns, leading to unassociated form elements for screen reader users. This breaks the link between the descriptive text (e.g., "Red Player") and the configuration input.
**Action:** Always check custom game setup menus and configuration screens to ensure `div` labels are replaced with proper `<label for="...">` elements that correctly target their respective form inputs.

## 2026-08-25 - Accessible Mobile Navigation Toggles
**Learning:** Implementing mobile navigation toggles (hamburger menus) requires semantic HTML and proper ARIA attributes to be usable by screen readers. A `<div>` with click handlers lacks inherent semantics and accessibility features. Using a native `<button>` combined with `aria-expanded` and `aria-controls` provides the necessary context for screen reader users to understand the state and purpose of the menu.
**Action:** Always verify that custom navigation toggles use native `<button>` elements and correctly manage `aria-expanded` based on the menu's state.
