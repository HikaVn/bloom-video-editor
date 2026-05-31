# UI設計案：動画編集ソフト（マルチテーマ）

日付: 2026-05-31

## 目的
- デフォルトは「女性向けの可愛いデザイン」を採用する
- ワンクリックで「男性向け」など別テイストに切り替えられるようにする
- すぐ運用できるよう、テーマと画面構成を明確に分離する

## 画面構成（編集画面：MVP）
- 上部：`Header`（プロジェクト名・保存・共有・エクスポート）
- 左側：`Asset / レイヤー`パネル（クリップ一覧・素材）
- 中央上：`プレビュー`（再生コントロール・Before/After）
- 中央下：`タイムライン`（トラック、インジケータ、クリップ編集）
- 右側：`プロパティ`（選択中エフェクト・ビューティー・音量）
- 下部：`ステータスバー`（長さ・書き出し進捗・レンダリング状態）

## テーマ設計思想
1. 1セットのコンポーネント構造を維持
2. テーマは CSS/Flutter Token で分離
3. 画像/アイコン・トーンは `theme.assets` で切替
4. `女性可愛い`は飽和色・丸み・装飾を増やす
5. `男性向け`は中間色・角丸縮小・コントラスト重視で整理

## レイヤー設計（推奨）
- `ThemePreset`（テーマID）
  - `light` / `dark`
  - `palette`: base, accent, danger, muted
  - `typography`: fontFamily, titleScale, uiScale
  - `radius`: panel, control, tag
  - `motion`: hoverLift, panelPulse
  - `effects`: shadowIntensity, blurStrength, glassStrength
  - `assets`: iconSet, emojiEnabled, mascotStyle
- `UIState`（ユーザー調整）
  - `accentOverride`
  - `fontOverride`
  - `buttonDensity`
  - `compactMode`
- テーマ切替は「編集を中断しない」ことを前提に即時反映

## テーマ候補
- `cute-pink`（デフォルト）
  - base: `#FFF4F8`
  - surface: `#FFE7F0`
  - panel: `#FFFFFF`
  - textStrong: `#3B2740`
  - accent1: `#FF74B1`
  - accent2: `#9B6DFF`（差し色）
  - border: `#F2CFDD`
  - radius: panel 18 / control 14 / tag 10
  - font: 軽やかで丸み（例: M PLUS 1, Poppins, Noto Sans）
  - motion: やや強め（フェード+軽いバウンス）
  - アイコン: 柔らかい丸アイコン
- `cool-minimal`（男性向け）
  - base: `#111418`
  - surface: `#1A202C`
  - panel: `#0F1723`
  - textStrong: `#E5E7EB`
  - accent: `#38BDF8`
  - accent2: `#22D3EE`
  - border: `#2D3748`
  - radius: panel 10 / control 8 / tag 8
  - font: 切れ味あるゴシック（例: Noto Sans JP, Inter）
  - motion: 低め（フェードのみ）
  - アイコン: エッジ寄りのライン

追加で用意したいテーマ（推奨）
- `warm-neutral`: 白～ベージ寄りの柔らかい落ち着き
- `mint-clean`: 明るいグリーン系で健康・メイク前処理向け
- `premium-ink`: 落ち着きのある濃紺＋金アクセント

## コンポーネント別の見た目ルール
- 左右パネルはガラス調（初期） or 固定背景（男性）
- 主要操作ボタンは最小2サイズ（44/52）
- トラックは「曲線」/「直線」をテーマで切り替え
- タイムラインのクリップは丸み/角角で切替
- 選択時は発光ではなく `outline + border`で統一（ダークテーマでも見やすく）
- 重要アクション（書き出し）はアクセントを必ず維持

## ビューティー向けUIをテーマ連動で設計
- スライダーはスキンを分離
  - 可愛いテーマ: ラベリング大きめ＋色バッジ
  - 男性向け: 数値ラベル＋小刻みステップ
- プレビュー比較は`Before/After`切替スイッチを目立たせる
- 「今の見た目」を固定表示できる `1Tap Beauty` ボタンを左下へ

## 画面導線（最短）
1. 素材を入れる
2. タイムラインを確認
3. 右側で調整
4. `1Tap Beauty` を試す
5. エクスポート

## 最初に実装するテーマ機能（最初の1スプリント）
- `cute-pink`と`cool-minimal`の2テーマ
- テーマ切替UI（右上プロフィール列に「見た目」メニュー）
- 全ボタン/カードに border + shadow の統一
- タイムライン、プレビュー、プロパティの最小構成
- テーマ永続化（ローカル保存）

## JSON例
```json
{
  "theme": "cute-pink",
  "mode": "light",
  "accentOverride": null,
  "buttonDensity": "comfortable",
  "compactMode": false
}
```

## 将来のテーマ拡張（任意）
- 自分好みで作る `Theme Builder` を追加
- クイックバッジで「女性向け」「男性向け」「作業向け」に分類
- 通知トースト/モーダル/ショートカット色まで同じテーマに従わせる

