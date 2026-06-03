# Security Notice

- `STRIPE_WEBHOOK_SECRET` は秘密鍵です。GitHubや公開ZIPに入れないでください。
- このプロジェクトでは `.env.example` にダミー値を入れています。
- 実際の値はVercelのEnvironment Variables、またはローカルの `.env.local` にだけ入れてください。
- 一度チャットなどに貼った `whsec_...` はStripeでローテーションするのがおすすめです。
