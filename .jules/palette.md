## 2024-10-24 - Missing Form Associations in Custom Game Setup UIs
**Learning:** Custom UI configurations for games often use generic `div` elements for labels next to `select` dropdowns, leading to unassociated form elements for screen reader users. This breaks the link between the descriptive text (e.g., "Red Player") and the configuration input.
**Action:** Always check custom game setup menus and configuration screens to ensure `div` labels are replaced with proper `<label for="...">` elements that correctly target their respective form inputs.
