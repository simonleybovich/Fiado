# Fiado

Bot de Telegram que registra quién te debe plata, cuánto y por qué. NestJS + arquitectura hexagonal + MongoDB. El texto libre se parsea a datos estructurados con un LLM vía OpenCode Zen (endpoint OpenAI-compatible).

## Arquitectura

Hexagonal por contexto (`src/contexts/debts`):

- `domain/` — entidad `Debt`, value object `Money`, ports (`DebtRepositoryPort`, `DebtParserPort`). Sin dependencias de framework.
- `application/` — casos de uso (`RegisterDebtUseCase`, `MarkAsPaidUseCase`, `ListPendingDebtsUseCase`, `DeleteDebtUseCase`). Reciben los ports por constructor, sin decoradores de Nest.
- `infrastructure/` — adaptadores concretos: `MongoDebtRepository` (Mongoose), `OpencodeDebtParserAdapter` (cliente `openai` contra OpenCode Zen), `TelegramUpdate` (Telegraf), y `TelegramBotModule` que ata cada port a su adapter vía providers de Nest.

Regla dura: `domain/` y `application/` no importan nada de Nest, Telegraf, Mongoose ni del cliente de OpenAI. Esas dependencias solo existen en `infrastructure/`.

## Variables de entorno

Ver `.env.example`. Resumen:

- `PORT` — puerto HTTP (default 3000).
- `MONGO_URI` — connection string de Mongo.
- `TELEGRAM_BOT_TOKEN` — token del bot (BotFather).
- `TELEGRAM_WEBHOOK_URL` — URL pública del servicio, sin el path del webhook (se agrega `/telegram/webhook` solo).
- `OPENCODE_API_KEY` — key de OpenCode Zen/Go.
- `OPENCODE_MODEL` — id exacto del modelo. Confirmalo contra `GET https://opencode.ai/zen/v1/models` (Zen) o la doc de Go — el catálogo cambia de tanto en tanto, no asumas un valor fijo.
- `OPENCODE_BASE_URL` — opcional. Por default pega contra Zen (`https://opencode.ai/zen/v1`). Si tenés saldo/cuota en OpenCode Go en vez de Zen, poné `https://opencode.ai/zen/go/v1` acá (misma API key, billetera/cuota distinta, otro catálogo de modelos).

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
