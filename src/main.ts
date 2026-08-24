import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { AppModule } from './app.module';
import { TELEGRAM_BOT } from './contexts/debts/infrastructure/telegram/telegram-bot.token';

const TELEGRAM_WEBHOOK_PATH = '/telegram/webhook';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const bot = app.get<Telegraf>(TELEGRAM_BOT);
  const webhookUrl = config.getOrThrow<string>('telegram.webhookUrl');

  app.use(bot.webhookCallback(TELEGRAM_WEBHOOK_PATH));
  await bot.telegram.setWebhook(`${webhookUrl}${TELEGRAM_WEBHOOK_PATH}`);

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
}

void bootstrap();
