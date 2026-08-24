# Fiado

Bot de Telegram que registra quién te debe plata, cuánto y por qué. NestJS + arquitectura hexagonal + MongoDB. El texto libre se parsea a datos estructurados con un LLM vía OpenCode Zen (endpoint OpenAI-compatible).

Ver `plan-bot-deudas-nest.md` para el plan de proyecto completo.

## Arquitectura

Hexagonal por contexto (`src/contexts/debts`):

- `domain/` — entidad `Debt`, value object `Money`, ports (`DebtRepositoryPort`, `DebtParserPort`). Sin dependencias de framework.
- `application/` — casos de uso (`RegisterDebtUseCase`, `MarkAsPaidUseCase`, `ListPendingDebtsUseCase`, `DeleteDebtUseCase`). Reciben los ports por constructor, sin decoradores de Nest.
- `infrastructure/` — adaptadores concretos: `MongoDebtRepository` (Mongoose), `OpencodeDebtParserAdapter` (cliente `openai` contra OpenCode Zen), `TelegramUpdate` (Telegraf), y `TelegramBotModule` que ata cada port a su adapter vía providers de Nest.

Regla dura: `domain/` y `application/` no importan nada de Nest, Telegraf, Mongoose ni del cliente de OpenAI. Esas dependencias solo existen en `infrastructure/`.

## Variables de entorno

No hay `.env.example` en el repo porque los permisos de este entorno bloquean escribir archivos `.env.*`. Creá tu propio `.env` en la raíz con estas claves:

```
PORT=3000

MONGO_URI=mongodb://localhost:27017/fiado

TELEGRAM_BOT_TOKEN=
# URL pública del servicio, SIN el path del webhook (se agrega /telegram/webhook solo)
TELEGRAM_WEBHOOK_URL=https://fiado.example.com

OPENCODE_API_KEY=
# Confirmá el id exacto contra GET https://opencode.ai/zen/v1/models con tu key,
# el catálogo cambia de tanto en tanto.
OPENCODE_MODEL=
```

## Desarrollo

```bash
npm install
npm run start:dev
```

Requiere una instancia de MongoDB accesible en `MONGO_URI` y un `TELEGRAM_BOT_TOKEN` válido — el bot corre en modo webhook, así que también necesita `TELEGRAM_WEBHOOK_URL` (una URL pública, típicamente vía túnel en desarrollo local).

## Tests

```bash
npm run test
npm run test:cov
```

Tests unitarios de dominio (`Debt`, `Money`) y de casos de uso (con mocks de los ports), sin infraestructura real.

## Comandos del bot

- Mensaje de texto libre → registra la deuda (ej: "Juan me debe 5000 pesos del asado del sábado").
- `/deudas` — lista las deudas pendientes del chat.
- `/pagado <id>` — marca una deuda como pagada.
- `/borrar <id>` — elimina una deuda.

## Deploy

Ver `DEPLOY.md`.

## Fuera de este repo

- Recordatorios automáticos: workflow de n8n con cron que consulta Mongo por deudas `pending` y manda el push por la Telegram Bot API.
