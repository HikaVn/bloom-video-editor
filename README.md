# Bloom Video Editor Prototype

スマホ向け動画編集アプリのUI検討用プロトタイプです。

現在は、女性向けのやわらかいBloom系デザインを方向性サンプルとして、ホーム、編集、エフェクト画面を切り替えられる静的HTMLで作っています。

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
outputs/beauty-feature-research.md    ビューティー機能調査
outputs/ui-design-theme-spec.md       デザインテーマ案
outputs/ui-wireframe-draft.md         UI叩き台
```

## 現在の実装メモ

- ホーム、編集、エフェクトの3画面を切り替えられます。
- 編集画面の操作ボタンは「最近の操作」に履歴として反映されます。
- Undo / Redo は操作履歴とプレビュー上のステータスメッセージに連動します。

## 複数端末で作業する流れ

1. GitHubでリポジトリを作る
2. このフォルダをpushする
3. 別端末でcloneする
4. 作業前に `git pull`
5. 作業後に `git add .`、`git commit`、`git push`

## 注意

動画素材、書き出し済み動画、大きな画像素材はGitに入れない方針です。
必要になったら、素材管理は別ストレージかGit LFSを検討します。
