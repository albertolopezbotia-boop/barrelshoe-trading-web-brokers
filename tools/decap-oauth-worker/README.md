# Puente de OAuth para el panel de mantenimiento

Este Worker deja que `/admin` inicie sesión con GitHub sin exponer ningún
secreto en el navegador. Se despliega **una sola vez**.

## 1. Crear la GitHub OAuth App

1. GitHub → foto de perfil → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Application name: `Barrelshoe Trading — admin`.
3. Homepage URL: `https://barrelshoetrading.com`.
4. Authorization callback URL: `https://<lo-que-elijas>.workers.dev/callback`
   (puedes ponerlo provisional y corregirlo después de desplegar el Worker,
   cuando sepas la URL real).
5. Guarda el **Client ID** y genera y guarda el **Client Secret** — el
   secreto solo se muestra una vez.

## 2. Desplegar el Worker

Necesitas una cuenta de Cloudflare (gratis, sin tarjeta) y Node en tu
máquina.

```bash
cd tools/decap-oauth-worker
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler deploy
```

`wrangler deploy` imprime la URL pública, algo como
`https://barrelshoe-decap-oauth.<tu-usuario>.workers.dev`.

## 3. Cerrar el círculo

1. Vuelve a la OAuth App de GitHub (paso 1) y pon la callback URL definitiva:
   `<esa URL>/callback`.
2. Pásame esa URL — la pego en `base_url` de `public/admin/config.yml`
   (Tarea 6 de este plan).
