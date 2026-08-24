import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import configuration from './shared/config/configuration';
import { TelegramBotModule } from './contexts/debts/infrastructure/telegram/telegram-bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('mongo.uri'),
      }),
    }),
    TelegramBotModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
