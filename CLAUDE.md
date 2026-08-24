# Fiado — convenciones del proyecto

Bot de Telegram que registra deudas informales. NestJS + arquitectura hexagonal + MongoDB.

## Regla dura de arquitectura

`src/contexts/debts/domain/` y `src/contexts/debts/application/` **no importan nada de Nest, Telegraf, Mongoose ni del cliente `openai`**. Esas dependencias solo existen en `src/contexts/debts/infrastructure/`.

- Las use-cases (`application/use-cases/`) son clases planas, sin `@Injectable()` ni `@Inject()`. Reciben sus dependencias (los ports) por constructor.
- El wiring entre ports y adapters vive en `TelegramBotModule` (`infrastructure/telegram/telegram-bot.module.ts`) usando providers `useFactory`, no `useClass` — así ningún archivo de dominio/aplicación necesita decoradores de Nest.
- Si una use-case necesita guardar o parsear algo, lo hace contra un `port` (interfaz en `domain/ports/`), nunca contra la librería concreta.

## Estructura

```
src/
  contexts/debts/
    domain/{entities,value-objects,ports}/
    application/{use-cases,dtos}/
    infrastructure/{persistence,parsing,telegram}/
  shared/config/
  main.ts
```

## Stack

- NestJS + TypeScript, Telegraf (modo webhook), Mongoose, cliente `openai` npm apuntando a `https://opencode.ai/zen/v1` (OpenCode Zen).
- El id exacto de `OPENCODE_MODEL` se confirma contra `GET /zen/v1/models` con la key real — cambia de tanto en tanto en el catálogo, no asumir un valor fijo.

## Tests

- Dominio (`Money`, `Debt`) y casos de uso tienen tests unitarios con mocks de los ports — son los más valiosos porque no requieren infraestructura real.
- No hay tests e2e: requerirían Mongo, Telegram y OpenCode reales para tener sentido; se eliminó el scaffold e2e por defecto de Nest.

## Variables de entorno

No hay `.env.example` en el repo (los permisos de este entorno bloquean escribir archivos `.env.*`). Las variables requeridas están documentadas en `README.md`.

## Fuera de este repo

Los recordatorios automáticos corren en un workflow de n8n separado (cron + Mongo query + Telegram Bot API), no viven acá.
