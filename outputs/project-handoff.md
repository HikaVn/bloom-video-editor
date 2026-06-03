# Bloom Video Editor Project Handoff

作成日: 2026-05-31  
最終更新: 2026-06-03

場所: `C:\Users\hikav\Documents\Codex\2026-05-31\win-mac-iphone`

## 現在の状態

スマホ向け動画編集アプリのUI検討プロジェクト。

現時点では、参考画像のような「やわらかいピンク」「かわいいけど幼すぎない」「女性向けのVlog/美容/日常記録に合う」雰囲気を、今後作るUIのデザイン方向として扱っている。

参考画像そのものを完成UIとしてコピーするのではなく、今後のアプリUIをこの雰囲気に寄せて仕上げていくためのデザイン例・方向性サンプル。

2026-06-03時点では、静的HTMLプロトタイプとして以下まで実装済み。

- ホーム、編集、テンプレートの画面切り替え
- 写真/動画の作成入口
- 写真読み込み、比率変更、簡易補正、写真保存
- 動画読み込み、トリム範囲指定、範囲書き出しUI
- ブラウザ再生できない動画への注意メッセージ
- 任意のローカルffmpeg補助による動画範囲書き出し
- 操作履歴、もどす、やり直す
- 「ここまで覚える」によるルーチン保存
- ホーム画面の「わたしのルーチン」からルーチン再利用
- 編集画面での保存済みルーチン削除

## Git / GitHub 状態

Git本体はインストール済み。

```text
git version 2.54.0.windows.1
```

ローカルリポジトリ化済み。ブランチは `main`。

現在の主なコミット:

```text
04263a3 Add routine reuse management
e55f960 Add local ffmpeg trim export helper
bd4f304 Show playback unsupported warning
bd717f1 Add trimmed video export action
25c46ec Support loading video URLs for preview
8de1539 Add video import and trim preview controls
```

GitHub CLIもインストール済み。

```text
gh version 2.93.0
```

GitHubログイン済み。

```text
github.com account HikaVn
```

GitHubリポジトリ作成・push済み。

```text
https://github.com/HikaVn/bloom-video-editor
```

リポジトリ設定:

```text
owner/repo: HikaVn/bloom-video-editor
visibility: PUBLIC
default branch: main
remote: origin
```

2026-05-31 追記: Codex GitHub App からもリポジトリ接続を確認済み。現在の環境では GitHub CLI は PATH 上にないが、clone/pull/push は通常の `git` で作業可能。

2026-06-03 追記: `main`と`origin/main`は同期済み。最新コミットは`04263a3 Add routine reuse management`。

## GitHubへ移行する次の手順

新しいターミナルを開き直すと `gh` のPATHが反映される可能性が高い。

ログイン:

```powershell
gh auth login
```

このリポジトリはすでにGitHubへpush済み。

別端末で取得する:

```powershell
git clone https://github.com/HikaVn/bloom-video-editor.git
cd bloom-video-editor
```

今後の通常運用:

```powershell
git pull
git add .
git commit -m "変更内容"
git push
```

ローカルの接続確認:

```powershell
git remote -v
git status
```

## 主なファイル

```text
README.md
.gitignore
.gitattributes
work/mobile-ui-prototype/index.html
work/mobile-ui-prototype/styles.css
work/mobile-ui-prototype/app.js
work/mobile-ui-prototype/export-helper.mjs
work/mobile-ui-prototype/manifest.webmanifest
work/mobile-ui-prototype/service-worker.js
outputs/beauty-feature-research.md
outputs/feature-implementation-list.md
outputs/ui-design-theme-spec.md
outputs/ui-wireframe-draft.md
outputs/project-handoff.md
```

## UIプロトタイプ

メインのプロトタイプ:

```text
work/mobile-ui-prototype/index.html
```

現在の画面構成:

- ホーム
- 編集
- テンプレート

以前は3画面を同時表示していたが、実アプリの想定に合わせて、1つのスマホ画面内で切り替える形に変更済み。

上部に画面切り替え:

- ホーム
- 編集
- テンプレート

主な導線:

- 新規作成 → 編集画面
- 編集画面のBeauty → テンプレート画面
- 編集画面の閉じる → ホーム
- テンプレート画面の編集へ → 編集画面
- ホーム画面のわたしのルーチン → 編集画面でルーチン再適用

## 実装済みの編集機能

写真関連:

- 写真ファイルの読み込み
- 写真編集モードへの切り替え
- 比率 1:1、4:5、9:16
- 明るさ、透明感、色温度、美肌のスライダー調整
- ナチュラル、透明感、ふんわり、フィルムのスタイル選択
- Before / After表示
- 補正後写真のPNG保存

動画関連:

- 動画ファイルの読み込み
- 動画URLからのプレビュー読み込み
- 開始/終了スライダーによるトリム範囲指定
- 指定範囲の再生
- ブラウザのMediaRecorderによる範囲書き出し
- ブラウザで難しい場合のローカルffmpeg補助
- 再生できない形式の可能性がある場合の警告表示

ルーチン関連:

- 編集操作を履歴として記録
- Undo / Redo
- 操作履歴を「ここまで覚える」で保存
- 保存名未入力時は「わたしのルーチン 1」のように自動命名
- 保存済みルーチンは最大5件保持
- ホーム画面には最大2件表示
- ホーム画面からルーチンを再適用
- 編集画面で保存済みルーチンを削除

## ローカルffmpeg補助

ファイル:

```text
work/mobile-ui-prototype/export-helper.mjs
```

起動例:

```bash
cd work/mobile-ui-prototype
node export-helper.mjs
```

前提:

- Node.jsが必要。
- `ffmpeg`がPATH上にある、または`FFMPEG_PATH`で指定されている必要がある。
- 補助サーバーは`127.0.0.1:4175`で起動する。
- 現状はローカル検証用。アプリ本体の正式な動画処理基盤ではない。

## デザイン方針

方向性:

- やわらかいピンク
- 花、光、余白、丸み
- 女性向け
- かわいいが幼すぎない
- 美容、Vlog、日常記録に合う
- 操作名はできるだけわかりやすく、親しみやすくする

避けたい方向:

- 完全な業務ツール風
- 暗く硬いUI
- 機能名が難しすぎるUI
- 画面が縦長になりすぎるメニュー
- 素材や機能が多すぎて最初から圧迫感がある構成

## これまでに検討した機能

ビューティー関連:

- 肌補正
- 美肌
- 明るさ補正
- 目元補正
- 歯のホワイトニング
- ワンタップ美容補正
- フィルター
- カラーグレーディング
- スタンプ
- タイトルテンプレート

編集関連:

- 分割
- テキスト
- 音楽
- スタンプ
- 速度調整
- 書き出し
- もどす
- やり直す

親しみやすい機能名:

- Undo → もどす
- Redo → やり直す
- Macro / preset → ここまで覚える、わたしのルーチン

## 「ここまで覚える」機能の考え方

複数の処理を確定した機能履歴として保存し、マクロのように呼び出せる機能。

実装済み:

- 操作履歴を並びで記録
- 操作を保存可能
- 保存時に名前を入力可能
- 名前未入力時は親しみやすい名前を自動付与
- 次回ワンタップで再実行
- 不要なルーチンを削除可能

今後の拡張候補:

- ルーチン名の変更
- 操作手順の詳細表示
- ルーチンの並び替え
- おすすめルーチンのプリセット化

候補名:

- ここまで覚える
- わたしのルーチン
- きらめきセット
- お気に入りルーチン

## 保存設計の方針

プロジェクト保存は、最初から強制しない方針がよさそう。

推奨:

- デフォルトはその場っきりのドラフト
- 良いものだけ明示的にプロジェクト保存
- ルーチンやプリセットはお気に入り保存できる

理由:

- 試しやすい
- 失敗しても捨てやすい
- 気に入った編集だけ残せる
- 初心者でも心理的ハードルが低い

## 複数端末で開発する運用

GitHub移行後は以下の流れ。

作業開始:

```powershell
git pull
```

作業後:

```powershell
git status
git add .
git commit -m "変更内容"
git push
```

別端末で初回取得:

```powershell
git clone https://github.com/<user>/<repo>.git
cd <repo>
```

## 注意点

動画素材や音声素材をそのままGitに入れない。

`.gitignore`で以下を除外済み:

- 動画ファイル
- 音声ファイル
- 大きいデザインファイル
- 一時ファイル
- ビルド成果物

将来的に素材管理が必要になった場合は、Git LFS、Google Drive、S3などを検討する。

## 次にやるとよさそうなこと

1. ホーム/編集/テンプレート画面の情報設計を整理する
2. ホーム画面の表示密度を調整する
3. ルーチン名の変更機能を追加する
4. ルーチンの中身を確認できる詳細表示を追加する
5. PWAのスマホ実機確認を行う
6. ビューティー機能一覧を優先度順に並べる
7. スマホ実装技術を決める

技術候補:

- まずはWebプロトタイプ
- iPhone/Androidを見据えるなら React Native / Expo
- Win/Macも視野に入れるなら Web + Electron / Tauri
- 動画処理は将来的に FFmpeg / MediaPipe / GPU処理を検討

## 現時点の結論

GitHub移行は完了。

プロトタイプは、単なる画面サンプルから、写真/動画の簡易編集、ルーチン保存・再利用、削除まで試せる状態に進んでいる。次はUI全体の情報設計を整えつつ、PWAやスマホ実機での表示確認に進むのがよい。

完了:

- GitHubログイン
- GitHubリポジトリ作成
- `main` ブランチのpush
- UIプロトタイプを `index.html` / `styles.css` / `app.js` に分割
- 編集画面に「最近の操作」パネルを追加
- 写真/動画読み込みと簡易編集UIを追加
- 動画トリム範囲指定と書き出しUIを追加
- ローカルffmpeg補助を追加
- 「ここまで覚える」と「わたしのルーチン」を追加
- 保存済みルーチンの再利用と削除を追加
- READMEと引き継ぎ資料を現状に合わせて更新
- 機能実装リストを開発管理表として更新

このプロジェクトは、複数端末からclone/pull/pushして継続開発できる状態。
