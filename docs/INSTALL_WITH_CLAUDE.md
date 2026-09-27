# Claude Code向け：既存Astro 5 + Vercelへの導入

## 成果物の使い分け

- `just-okinawa-v2-full.zip`：動作確認済みの独立したAstroプロジェクト。サンプル記事6本を含む。既存リポジトリに丸ごと上書きしない。
- `just-okinawa-v2-integration.zip`：既存プロジェクトへ移植するUIと補助ファイル。記事、package.json、Astro設定、BaseHead、既存記事ルート、既存schemaは含まない。
- `just-okinawa-preview.html`：全20ページのデザイン・地図・ブログ検索・記事への遷移を単体確認するファイル。ダウンロード後、Chromeなどのブラウザーで開く。プレビュー内の記事はデモ。

## 導入順序

1. 既存のCLAUDE.md / AGENTS.md、package.json、Astro設定、src/content.config.ts（またはsrc/content/config.ts）、記事ルート、BaseHead、RSS、Vercel連携を読む。変更状況を確認し、既存作業を保護したブランチで進める。
2. integration.zipの内容を確認してコピーする。重複する`src/pages/about.astro`と`src/pages/about/index.astro`などがある場合は、既存の運営者情報を残しつつ1つのルートに統合する。元サイト固有のポリシー、SEO、計測タグ、既存URLも保持する。
3. 既存のblogコレクションのschemaに`src/lib/editorial-schema.ts`の`editorialFields`を**追加マージ**する。既存loader・スキーマ・affiliateLinks定義は消さない。

```ts
// src/content.config.tsでの例。実際のファイル位置に合わせてimportを調整。
import { editorialFields } from './lib/editorial-schema';

// 既存schema: ({ image }) => z.object({ ...既存のフィールド... })
// の最後を次のように拡張する：
// z.object({ ...既存のフィールド... }).extend(editorialFields)
```

4. 既存の記事生成ルート（通常`src/pages/blog/[...slug].astro`）で公開対象を統一する。既存のrenderやprops、URL生成ロジックを保ちながら、getCollection後に共通フィルターを追加する。

```ts
import { published } from '../../lib/editorial';
const posts = (await getCollection('blog')).filter(published);
```

5. 既存RSS、サイトマップ、検索インデックスにも同じ公開条件を適用する。独自sitemapがある場合は新しいsitemap.xml.tsと競合させず、島・体験・planルートを既存方式に追加する。既存RSSがない場合、新規RSSはこのパッケージの必須機能ではない。
6. `BaseHead`がviewport、title、description、canonicalを出力しているかを確認する。Astroのsite設定に既存の本番ドメインが入っているかを確認し、localhostを公開しない。既存のOGP、構造化データ、計測タグは維持する。
7. `npm install -D gray-matter @astrojs/check typescript`を必要に応じて実行する。既存scriptsを残して`check: astro check`、`validate:post: node scripts/validate-post.mjs`を追加する。UI自体は新しいUIライブラリ不要。地図は生成済みSVGデータのためd3の追加も不要。
8. 任意の既存記事2〜3本に内容に合うdestinationとexperiencesを付け、島別・体験別の接続を確認する。旧記事を機械的に分類しない。分類なし記事もトップと通常一覧には表示される。
9. 開発サーバーでトップ・地図5箇所・スマホメニュー・検索・月別・複合絞り込み・記事・関連記事・アフィリエイト・既存aboutなどを確認する。型チェックとビルドを実行する。
10. 既存の承認済みVercel公開フローで公開し、デプロイ成功と実URLを確認する。サイトやアカウントを新規作成する必要はない。

## 既存自動投稿フローへの接続

自動投稿の指示ファイルを見つけ、`docs/CLAUDE_PUBLISHING.md`の参照を追加してください。既存CLAUDE.mdを置き換えず、次のブロックだけを追記する形にします。

```md
## JUST OKINAWA publishing
For content publishing, read and follow docs/CLAUDE_PUBLISHING.md.
New posts require destination, experiences, heroAlt, image attribution and a timezone-aware publication datetime.
Run the per-post validator, type check and production build before the established deployment workflow.
Keep layout, components and site configuration unchanged during routine daily posting.
```

既存の投稿スケジュール・タスク・認証を推測して変更しないでください。

## 導入依頼としてそのまま渡せる文章

> 添付のjust-okinawa-v2-integration.zipとdocs/INSTALL_WITH_CLAUDE.mdに沿って、現在のJUST OKINAWAへ新デザインを移植してください。既存記事、画像、URL、SEO設定、アフィリエイト、Vercel設定、自動投稿フローを維持し、schemaの追加マージとdraft/未来記事の公開条件を全ルートで統一してください。毎日の自動投稿指示へdocs/CLAUDE_PUBLISHING.mdの参照を追加し、記事追加だけでトップ・島・体験・検索一覧へ反映されることを確認してください。型チェック・ビルド・PC/スマホ確認を完了し、既存の承認済み公開手順に従って結果を報告してください。

## 素材と保守

- `public/images`は出典確認済みの沖縄写真。公開のたびに外部サービスから取得しない。
- 画像出典は`public/photo-sources.json`と`/credits/`を維持する。自分の写真へ置き換える際にaltと撮影地も更新する。
- 久米島は撮影地を確認できる写真を用意していないため文字パネルを使用。他地域の写真で代用しない。
- 地図形状はNatural Earth。島の位置関係を示すためのもので、道路・航路案内には使わない。
- 記事一覧は全件の軽量なHTMLテンプレートを持ち、表示分12件だけ画像を読み込む。記事が数千件規模になったら検索インデックス分離とサーバー/静的ページ分割を検討する。
- 本体はAstro 5 / 静的出力。Vercelアダプターや外部データベースは追加不要。
