## 2024-08-24 - Unused Penpot API Integration
**Learning:** The codebase contained an unused Penpot API integration (`fetchPenpotDesign`) that executed an HTTP request on every page load but only logged the result to the console. This is an anti-pattern that slows down page load and wastes network/compute resources.
**Action:** When inspecting front-end files, check for API calls that trigger on startup (e.g. in `DOMContentLoaded`) but are not actually used to update the UI or app state.
