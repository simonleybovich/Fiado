import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Telegraf } from 'telegraf';
import {
  DebtSchema,
  DebtSchemaClass,
  DebtDocument,
} from '../persistence/debt.schema';
import { MongoDebtRepository } from '../persistence/mongo-debt.repository';
import { OpencodeDebtParserAdapter } from '../parsing/opencode-debt-parser.adapter';
import { RegisterDebtUseCase } from '../../application/use-cases/register-debt.use-case';
import { MarkAsPaidUseCase } from '../../application/use-cases/mark-as-paid.use-case';
import { ListPendingDebtsUseCase } from '../../application/use-cases/list-pending-debts.use-case';
import { DeleteDebtUseCase } from '../../application/use-cases/delete-debt.use-case';
import {
  DEBT_REPOSITORY,
  DebtRepositoryPort,
} from '../../domain/ports/debt-repository.port';
import {
  DEBT_PARSER,
  DebtParserPort,
} from '../../domain/ports/debt-parser.port';
import { TELEGRAM_BOT } from './telegram-bot.token';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: DebtSchemaClass.name, schema: DebtSchema },
    ]),
  ],
  providers: [
    {
      provide: DEBT_REPOSITORY,
      useFactory: (model: Model<DebtDocument>) =>
        new MongoDebtRepository(model),
      inject: [getModelToken(DebtSchemaClass.name)],
    },
    {
      provide: DEBT_PARSER,
      useFactory: (config: ConfigService) =>
        new OpencodeDebtParserAdapter(
          config.getOrThrow<string>('opencode.apiKey'),
          config.getOrThrow<string>('opencode.model'),
          config.get<string>('opencode.baseUrl'),
        ),
      inject: [ConfigService],
    },
    {
      provide: TELEGRAM_BOT,
      useFactory: (config: ConfigService) =>
        new Telegraf(config.getOrThrow<string>('telegram.botToken')),
      inject: [ConfigService],
    },
    {
      provide: RegisterDebtUseCase,
      useFactory: (parser: DebtParserPort, repository: DebtRepositoryPort) =>
        new RegisterDebtUseCase(parser, repository),
      inject: [DEBT_PARSER, DEBT_REPOSITORY],
    },
    {
      provide: MarkAsPaidUseCase,
      useFactory: (repository: DebtRepositoryPort) =>
        new MarkAsPaidUseCase(repository),
      inject: [DEBT_REPOSITORY],
    },
    {
      provide: ListPendingDebtsUseCase,
      useFactory: (repository: DebtRepositoryPort) =>
        new ListPendingDebtsUseCase(repository),
      inject: [DEBT_REPOSITORY],
    },
    {
      provide: DeleteDebtUseCase,
      useFactory: (repository: DebtRepositoryPort) =>
        new DeleteDebtUseCase(repository),
      inject: [DEBT_REPOSITORY],
    },
    TelegramUpdate,
  ],
  exports: [TELEGRAM_BOT],
})
export class TelegramBotModule {}
