# ZYRANEXT Labs Production v4.0 — Stripe Auto Upgrade Connected

本番用の **Stripe購入 → Webhook受信 → Supabaseプラン自動更新 → 機能解放** 実装済みプロジェクトです。

## v4で接続済みのStripe Price IDs

```env
STRIPE_PRO_PRICE_ID=price_1Te9DYJHP6f3jAKbNMMk2lYI
STRIPE_CREATOR_PRICE_ID=price_1Te9F6JHP6f3jAKb1FhwUoi2
STRIPE_TEAM_PRICE_ID=price_1Te9FTJHP6f3jAKbQOuiTFFu
```

## 重要：Webhook Secretについて

このZIPには、セキュリティのため実際の `whsec_...` は入れていません。

Stripeで取得した `whsec_...` は **VercelのEnvironment Variables** またはローカルの `.env.local` にだけ入れてください。

さらに、チャット上に一度貼ったSecretは安全のためStripeで再生成するのがおすすめです。

## プラン制御

| Plan | 価格 | 解放機能 |
|---|---:|---|
| Free | $0 | 月20回AI生成、Title/Hook/Content、Profile |
| Pro | $19/mo | Unlimited AI、Creator Memory、Cloud Save、Clip AI、Basic Overlay、Overlay URL 30日 |
| Creator | $49/mo | Pro全部、Analytics、Growth Dashboard、Full Overlay、Stream Tracking、Overlay URL 90日 |
| Team | $149/mo | Creator全部、Team Workspace、Shared Dashboard、Overlay URL長期 |

## Free制限

- Freeは月20回まで
- FreeはClip AI使用不可
- FreeはOverlay Builder使用不可
- 上限到達時にUpgrade Modal表示

## Overlay期限

- Pro: 30日
- Creator: 90日
- Team: 長期
- 課金切れ / 支払い失敗 / 期限切れでOBS側URLは自動で使用不可表示

## 必要な環境変数

`.env.example` を `.env.local` にコピーして設定してください。

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=whsec_REGENERATE_AND_PASTE_HERE

STRIPE_PRO_PRICE_ID=price_1Te9DYJHP6f3jAKbNMMk2lYI
STRIPE_CREATOR_PRICE_ID=price_1Te9F6JHP6f3jAKb1FhwUoi2
STRIPE_TEAM_PRICE_ID=price_1Te9FTJHP6f3jAKbQOuiTFFu
```

## Webhook設定

Stripe Dashboard → Webhooks → エンドポイントを追加

URL:

```txt
https://your-domain.com/api/stripe/webhook
```

イベント:

```txt
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

Supabase SQL Editorで `supabase/schema.sql` を実行してください。

## 本番デプロイ

Vercelにアップロードして、Environment Variablesに `.env.local` と同じ値を入れます。

ドメイン変更時はStripe Webhook URLだけ変更してください。


## v4.8 Update
- Pricing buttons now use direct Stripe Payment Links, so clicking Pro / Creator / Team always opens Stripe.
- Pricing labels are written as `/ month`.
- Webhook includes fallback matching by Stripe customer email and purchased Price ID.
