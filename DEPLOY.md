# Deploy

La app es un contenedor Docker estándar (ver `Dockerfile`), así que corre en cualquier plataforma que sepa levantar imágenes Docker detrás de HTTPS — Dokploy, Coolify, Railway, Fly.io, un VPS propio con Traefik/Nginx, etc. No está atada a ningún proveedor en particular.

## Requisitos

1. Un host que pueda buildear/correr el `Dockerfile` de este repo y exponerlo detrás de un dominio con HTTPS (Telegram exige HTTPS para webhooks, no acepta HTTP).
2. Una instancia de MongoDB accesible desde ese host (gestionada tipo Atlas, o un contenedor de Mongo en el mismo host/red).
3. Las variables de entorno cargadas en la plataforma elegida (ver `README.md`) — nunca commitear un `.env` real.

## Pasos generales

1. Conseguí un dominio HTTPS público apuntando al contenedor (la mayoría de las plataformas mencionadas arriba lo resuelven automáticamente con Let's Encrypt).
2. Seteá `TELEGRAM_WEBHOOK_URL` exactamente con esa URL pública (sin path, sin trailing slash) — `main.ts` le agrega `/telegram/webhook` y llama `setWebhook` al bootear.
3. Seteá `MONGO_URI` apuntando a tu instancia de Mongo.
4. Deployá. Cada boot relanza `setWebhook`, así que no hace falta reconfigurarlo a mano tras un restart.
5. Confirmá que el webhook quedó activo:
   ```
   https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo
   ```

## Notas

- El healthcheck vive en `GET /health`.
