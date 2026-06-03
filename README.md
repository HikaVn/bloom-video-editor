# Bloom Video Editor Prototype

スマホ向け動画編集アプリのUI検討用プロトタイプです。

現在は、女性向けのやわらかいBloom系デザインを方向性サンプルとして、ホーム、編集、テンプレート画面を切り替えられる静的HTMLで作っています。

## 開き方

ブラウザで次のファイルを開きます。

```text
work/mobile-ui-prototype/index.html
```

## 構成

```text
work/mobile-ui-prototype/index.html   UIプロトタイプのHTML
work/mobile-ui-prototype/styles.css   UIプロトタイプのスタイル
work/mobile-ui-prototype/app.js       画面切替・操作履歴の動作
work/mobile-ui-prototype/export-helper.mjs  ローカルffmpeg書き出し補助
work/mobile-ui-prototype/manifest.webmanifest  PWA設定
work/mobile-ui-prototype/service-worker.js  アプリシェルのキャッシュ
outputs/beauty-feature-research.md    ビューティー機能調査
outputs/feature-implementation-list.md 機能実装リスト
outputs/ui-design-theme-spec.md       デザインテーマ案
outputs/ui-wireframe-draft.md         UI叩き台
outputs/project-handoff.md            引き継ぎメモ
```

## 現在の実装メモ

- ホーム、編集、テンプレートの3画面を切り替えられます。
- 編集画面の操作ボタンは「最近の操作」に履歴として反映されます。
- Undo / Redo は操作履歴とプレビュー上のステータスメッセージに連動します。
- 「ここまで覚える」で操作履歴をルーチンとして保存できます。
- 保存済みルーチンは編集画面とホーム画面の「わたしのルーチン」に表示されます。
- ホーム画面から保存済みルーチンを再適用できます。
- 保存済みルーチンは編集画面で削除できます。
- 写真読み込み、比率変更、明るさ・透明感・色温度・美肌の簡易調整、写真保存ができます。
- 動画読み込み、再生範囲指定、範囲書き出しのUIがあります。
- ブラウザ標準機能で動画書き出しできない場合、任意でローカルffmpeg補助を使えます。

## ローカルffmpeg補助

動画の範囲書き出しを安定させたい場合は、別ターミナルで次を起動します。

```bash
cd work/mobile-ui-prototype
node export-helper.mjs
```

前提:

- Node.jsが使えること。
- `ffmpeg`がPATH上にある、または`FFMPEG_PATH`で指定されていること。
- 補助サーバーは`127.0.0.1:4175`で起動します。
- 現状はローカル検証用の補助機能です。本番用の動画処理基盤ではありません。

## 複数端末で作業する流れ

1. GitHubでリポジトリを作る
2. このフォルダをpushする
3. 別端末でcloneする
4. 作業前に `git pull`
5. 作業後に `git add .`、`git commit`、`git push`

## 注意

動画素材、書き出し済み動画、大きな画像素材はGitに入れない方針です。
必要になったら、素材管理は別ストレージかGit LFSを検討します。
