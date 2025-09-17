# Project Rules
- Append-only; reflect newly agreed constraints.

## Baseline
- Do not change key names / IDs / types.
- Do not break existing payloads/APIs.
- Keep changes minimal and localized. No mass reformat.

## 2025/09/17
- Admin UI is a dedicated page; master mode cannot send SMS.
- Admin auth uses adminPass = <basePassword> + "master" (sessionStorage; cleared on logout).
- Template placeholders: {phoneNumber} {sumaeruNumber} {operator} {today}
- 管理系POSTはプリフライト回避のため既定ヘッダを付けない（GAS WebApp /exec）。
