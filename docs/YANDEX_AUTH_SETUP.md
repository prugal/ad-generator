## Yandex login setup (Supabase custom OAuth provider)

### Why `provider: 'yandex'` failed

Ошибка `Unsupported provider: Provider yandex could not be found` означает, что в Supabase не был корректно создан custom OAuth provider `yandex`.

### What was changed in code

- `services/authService.ts`
  - Yandex path использует `supabase.auth.signInWithOAuth({ provider: 'custom:yandex' })`.
- `components/AuthButton.tsx`
  - Yandex button показывает понятную ошибку, если провайдер не настроен в Supabase.

### Environment variables

Специальные env для Yandex не требуются (кроме стандартных Supabase URL/key).

---

## Step-by-step configuration

### 1) Create app in Yandex OAuth

In Yandex OAuth console:

1. Create app (`Web services` platform).
2. Set required permissions (at least basic profile/email according to your needs).
3. Add redirect URI provided by Supabase SSO/OIDC configuration.

Notes from Yandex docs:
- redirect URI must match exactly;
- do not use localhost in Yandex redirect URI settings.

### 2) Configure custom OAuth provider in Supabase

In Supabase dashboard:

1. Open your project.
2. Go to Authentication -> Providers -> **OAuth provider** (custom).
3. Create provider:
   - Provider Identifier: `yandex`
   - Protocol: `oauth2`
   - Authorization URL: `https://oauth.yandex.ru/authorize`
   - Token URL: `https://oauth.yandex.ru/token`
   - Userinfo URL: `https://login.yandex.ru/info`
   - Scopes: `login:email login:info` (через пробел)
4. Сохраните провайдер.

Важно: в запросе к Supabase этот провайдер вызывается как `custom:yandex`.

### 3) Redirect URLs

For this app, post-auth callback is:

`<your-site-url>/auth/callback`

Make sure this URL is:
- allowed in Supabase Auth redirect URLs;
- used as `redirectTo` (already done in code);
- aligned with your Yandex OAuth app setup.

### 4) Verify flow

1. Start app.
2. Open login modal.
3. Click `Войти через Яндекс`.
4. Complete Yandex auth.
5. You should return to `/auth/callback`, then redirect to saved path or `/generator`.

---

## Troubleshooting

- `Unsupported provider: Provider yandex could not be found`
  - В Supabase отсутствует custom OAuth provider с identifier `yandex`.
  - Проверьте, что provider сохранен именно как `yandex`.

- `invalid_scope` / ошибки scope
  - Используйте scopes через пробел: `login:email login:info`.

- Redirect mismatch errors
  - Check exact callback URL consistency in Yandex app, Supabase provider settings, and Supabase allowed redirects.
