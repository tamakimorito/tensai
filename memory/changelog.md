# Changelog
- Format: `YYYY/MM/DD - vX.Y.Z`: short title
- Rules: append-only, do not rewrite history.

## 2025/09/17 - v1.3.0
- Add dedicated Admin Templates screen (CRUD/toggle/reorder) for MMK/KMK.
- Load templates from GAS (template_list/*). Stop referencing local mmkTemplates.
- Support {operator}/{today} replacement in preview/send.
- Keep existing APIs/types unchanged.

## 2025/09/17 - v1.3.1
- 管理系POSTのプリフライト回避（Content-Typeヘッダ削除）。
- Admin画面に「更新者」入力を追加し、保存時に updatedBy を送信。
- プレースホルダのチップ表示・クリック挿入・説明を追加。

## 2025/09/17 - v1.3.2
- Adminテンプレ保存の失敗を可視化（共通fetchヘルパ導入、ok:false/403をUI通知）。
- 更新者入力をモーダル内へ移動し必須化。保存時にlocalStorageへ記憶。
- プレースホルダのチップ＋説明をモーダル内に集約。

## 2025/09/29 - v1.4.0
- 送信画面: 電話番号入力時に、同一番号への直近の送信履歴を1件表示する機能を追加しました。
- この表示は読み取り専用で、既存の送信フローに影響はありません。

## 2025/10/02 - v1.0.2
- 送信画面の「前回送信履歴」を全履歴リスト表示に変更。
- operator が不明な場合は「（不明）」と表示。
- UIは固定のまま、縦スクロールで過去分を確認可能。

## 2025/10/02 - v1.0.3
- VER表示をchangelog.md同期方式に変更（UI最小差分）

## 2025/10/02 - v1.0.4
- サイドバーのブランド行にVER（静的）を表示。flex + nowrap + shrink-0 で見切れ防止。
