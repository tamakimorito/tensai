# Changelog
- Format: `YYYY/MM/DD - vX.Y.Z`: short title
- Rules: append-only, do not rewrite history.

## 2025/09/17 - v1.3.0
- Add dedicated Admin Templates screen (CRUD/toggle/reorder) for MMK/KMK.
- Load templates from GAS (template_list/*). Stop referencing local mmkTemplates.
- Support {operator}/{today} replacement in preview/send.
- Keep existing APIs/types unchanged.
