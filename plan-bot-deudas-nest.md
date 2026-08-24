# Fiado — plan de proyecto

Bot de Telegram que registra quién te debe plata, cuánto y por qué, con recordatorios automáticos. NestJS + arquitectura hexagonal + MongoDB, mismo patrón que Ordinal/Brokerd. Recordatorios via un workflow separado en n8n (no vive en este repo).

## Nombre

- Repo: `fiado` (o `fiado-bot` si `fiado` está tomado)
- `package.json` → `name: "fiado"`
- Bot de Telegram: `@fiado_bot` (si está libre; si no, `@fiado_ar_bot` o similar)
- Contenedor en Dokploy: `fiado`

## Stack

- NestJS + TypeScript
- Telegraf (bot de Telegram, modo webhook)
- MongoDB (Mongoose)
- OpenCode Zen (tu key de OpenCode) para parsear mensajes de texto libre a datos estructurados — endpoint OpenAI-compatible, mismo mecanismo que ya usás para rutear a Kimi/DeepSeek/Qwen/GLM en tu setup de n8n
- Deploy: Dokploy sobre la VPS de Oracle Cloud, detrás de Traefik

## Arquitectura (hexagonal)

```
src/
  contexts/
    debts/
      domain/
        entities/
          debt.entity.ts
        value-objects/
          money.vo.ts
        ports/
          debt-repository.port.ts
          debt-parser.port.ts
      application/
        use-cases/
          register-debt.use-case.ts
          mark-as-paid.use-case.ts
          list-pending-debts.use-case.ts
          delete-debt.use-case.ts
        dtos/
          parsed-debt.dto.ts
      infrastructure/
        persistence/
          debt.schema.ts
          mongo-debt.repository.ts
        parsing/
          opencode-debt-parser.adapter.ts
        telegram/
          telegram-bot.module.ts
          telegram.update.ts
  shared/
    config/
  main.ts
```

Regla dura: `domain/` y `application/` no importan nada de Nest, Telegraf, Mongoose ni del cliente de OpenCode. Esas dependencias solo existen en `infrastructure/`. Si una use-case necesita guardar o parsear algo, lo hace contra un `port` (interfaz), nunca contra la librería concreta.

## Modelo de datos

```
Debt {
  id
  debtorName
  amount
  currency
  reason
  date
  status: "pending" | "paid"
  telegramChatId   // quién lo registró
  createdAt
}
```

## Fases de build

Cada fase es una sesión de Claude Code razonable — no metas todo en un solo prompt gigante.

**Fase 0 — Setup**
`nest new`, instalar `@nestjs/mongoose`, `telegraf`, `openai` (cliente OpenAI, apuntado al endpoint de OpenCode Zen), `@nestjs/config`. `.env.example` con `MONGO_URI`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_URL`, `OPENCODE_API_KEY`, `OPENCODE_MODEL`. Dockerfile básico.

**Fase 1 — Dominio**
Entidad `Debt`, value object `Money` (monto + moneda, validación de que no sea negativo), y los ports `DebtRepositoryPort` / `DebtParserPort` como interfaces puras.

**Fase 2 — Persistencia**
Schema de Mongoose para `Debt` y `MongoDebtRepository` implementando `DebtRepositoryPort`.

**Fase 3 — Casos de uso**
`RegisterDebtUseCase`, `MarkAsPaidUseCase`, `ListPendingDebtsUseCase`, `DeleteDebtUseCase`. Reciben los ports por constructor (inyección de dependencias), sin saber que Mongo o Telegram existen. Buen punto para tests unitarios con mocks de los ports.

**Fase 4 — Parser con LLM**
`OpencodeDebtParserAdapter` implementando `DebtParserPort`: usa el cliente `openai` de npm con `baseURL` apuntando al endpoint de OpenCode Zen y tu `OPENCODE_API_KEY`, contra el modelo que definas en `OPENCODE_MODEL` (algo liviano y rápido alcanza para esto, no hace falta el modelo más caro del catálogo). Manda el texto libre con un prompt que pide devolver únicamente JSON (`{ debtorName, amount, currency, reason, date }`), parsea y valida la respuesta. Antes de codear esto, pegale un `GET` a `https://opencode.ai/zen/v1/models` con tu key para confirmar el id exacto del modelo que quieras usar — cambia de tanto en tanto en el catálogo.

**Fase 5 — Adaptador de Telegram**
`TelegramUpdate` con Telegraf: escucha mensajes de texto, los pasa por el parser, arma el `RegisterDebtUseCase`, responde confirmando lo que entendió (con opción de corregir antes de guardar).

**Fase 6 — Wiring**
Módulo de Nest que ata cada port a su adapter concreto via providers (`{ provide: DebtRepositoryPort, useClass: MongoDebtRepository }`).

**Fase 7 — Deploy**
Dockerfile final, config de Dokploy, webhook de Telegram apuntando a la URL pública detrás de Traefik (HTTPS).

**Fase 8 — Recordatorios (fuera de este repo)**
Workflow de n8n con cron que consulta Mongo por deudas `pending` y manda el push por la Telegram Bot API.

**Fase 9 — Opcional**
Tool de MCP (`list_debts`) sobre el mismo patrón que `job-pipeline-mcp`, para poder preguntarle a Claude directamente quién te debe plata.

## Cómo usarlo con Claude Code

1. Creá el repo vacío y tirá este archivo adentro como `PLAN.md`.
2. Primer prompt: pedile a Claude Code que lea `PLAN.md` y genere un `CLAUDE.md` con las convenciones del proyecto (la regla de dominio sin dependencias de framework, la estructura de carpetas, el stack). Ese `CLAUDE.md` va a quedar como contexto persistente para todas las sesiones siguientes en ese repo.
3. Andá fase por fase: un prompt tipo "Arrancá la fase 1 del PLAN.md: entidad Debt y los ports, con tests unitarios" — commiteá al cerrar cada fase antes de pasar a la siguiente.
4. Pedile explícitamente tests unitarios en las fases 1 y 3 (dominio y casos de uso), son las que más valor tienen por ser las más fáciles de testear sin mocks pesados.
5. En la fase 4, dale el prompt exacto que querés usar para el parser — así Claude Code no inventa uno improvisado.
