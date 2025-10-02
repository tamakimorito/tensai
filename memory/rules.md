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

## 2025/10/02
- 履歴表示は“前回1件”ではなく“対象番号全件”を出す。ただしUI構造は固定し、大規模改修は行わない。

## 2025/10/02 - Version表示（静的）
- VERはSidebarの APP_VERSION 定数で人手更新。UIは最小差分で固定。

## 2025/10/02 - History・Version運用
- 履歴ページ：電話番号のみの検索は既定で過去7日（任意daysで上書き可、上限31）。
- 送信画面：同番号履歴は過去3日（UI注記必須）。
