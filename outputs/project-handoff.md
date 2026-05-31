# Bloom Video Editor Project Handoff

作成日: 2026-05-31  
場所: `C:\Users\hikav\Documents\Codex\2026-05-31\win-mac-iphone`

## 現在の状態

スマホ向け動画編集アプリのUI検討プロジェクト。

現時点では、参考画像のような「やわらかいピンク」「かわいいけど幼すぎない」「女性向けのVlog/美容/日常記録に合う」雰囲気を、今後作るUIのデザイン方向として扱っている。

参考画像そのものを完成UIとしてコピーするのではなく、今後のアプリUIをこの雰囲気に寄せて仕上げていくためのデザイン例・方向性サンプル。

## Git / GitHub 状態

Git本体はインストール済み。

```text
git version 2.54.0.windows.1
```

ローカルリポジトリ化済み。ブランチは `main`。

現在のコミット:

```text
002ae5e Add cross-platform git attributes
7aa0529 Initial mobile video editor prototype
```

GitHub CLIもインストール済み。

```text
gh version 2.93.0
```

ただし、GitHubログインはまだ。

```text
You are not logged into any GitHub hosts.
```

そのため、GitHubへのpushはまだ完了していない。

## GitHubへ移行する次の手順

新しいターミナルを開き直すと `gh` のPATHが反映される可能性が高い。

ログイン:

```powershell
gh auth login
```

このリポジトリをGitHubに作成してpushする例:

```powershell
cd C:\Users\hikav\Documents\Codex\2026-05-31\win-mac-iphone
gh repo create bloom-video-editor --private --source . --remote origin --push
```

公開リポジトリにする場合:

```powershell
gh repo create bloom-video-editor --public --source . --remote origin --push
```

すでにGitHub側で空リポジトリを作っている場合:

```powershell
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

## 主なファイル

```text
README.md
.gitignore
.gitattributes
work/mobile-ui-prototype/index.html
outputs/beauty-feature-research.md
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
- エフェクト

以前は3画面を同時表示していたが、実アプリの想定に合わせて、1つのスマホ画面内で切り替える形に変更済み。

上部に画面切り替え:

- ホーム
- 編集
- エフェクト

主な導線:

- 新規作成 → 編集画面
- 編集画面のフィルター/スタンプ → エフェクト画面
- 編集画面の閉じる → ホーム
- エフェクト画面の編集へ → 編集画面

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

方向性:

- 操作履歴を並びで記録
- 2つ以上の操作を保存可能
- 保存時に親しみやすい名前を提案
- 次回ワンタップで再実行

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

1. GitHubにログインしてpushする
2. `index.html` を小さなファイルに分割するか検討する
3. ホーム/編集/エフェクト画面の情報設計を整理する
4. 「ここまで覚える」を現在のBloom風UIへ再統合する
5. ビューティー機能一覧を優先度順に並べる
6. スマホ実装技術を決める

技術候補:

- まずはWebプロトタイプ
- iPhone/Androidを見据えるなら React Native / Expo
- Win/Macも視野に入れるなら Web + Electron / Tauri
- 動画処理は将来的に FFmpeg / MediaPipe / GPU処理を検討

## 現時点の結論

GitHub移行は、ローカル準備とGitHub CLIインストールまで完了。

未完了:

- GitHubログイン
- GitHubリポジトリ作成
- `main` ブランチのpush

このプロジェクトは、今後のUI設計を進めるためのベースとして継続可能な状態。
