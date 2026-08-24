import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { RegisterDebtUseCase } from '../../application/use-cases/register-debt.use-case';
import {
  MarkAsPaidUseCase,
  DebtNotFoundError,
} from '../../application/use-cases/mark-as-paid.use-case';
import { ListPendingDebtsUseCase } from '../../application/use-cases/list-pending-debts.use-case';
import { DeleteDebtUseCase } from '../../application/use-cases/delete-debt.use-case';
import { TELEGRAM_BOT } from './telegram-bot.token';

@Injectable()
export class TelegramUpdate implements OnModuleInit {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    @Inject(TELEGRAM_BOT) private readonly bot: Telegraf,
    private readonly registerDebtUseCase: RegisterDebtUseCase,
    private readonly markAsPaidUseCase: MarkAsPaidUseCase,
    private readonly listPendingDebtsUseCase: ListPendingDebtsUseCase,
    private readonly deleteDebtUseCase: DeleteDebtUseCase,
  ) {}

  onModuleInit(): void {
    this.bot.start((ctx) =>
      ctx.reply(
        'Hola! Contame quién te debe plata, cuánto y por qué.\n' +
          'Ej: "Juan me debe 5000 pesos del asado del sábado".\n\n' +
          'Comandos: /deudas para ver lo pendiente, /pagado <id> y /borrar <id>.',
      ),
    );

    this.bot.command('deudas', async (ctx) => {
      const debts = await this.listPendingDebtsUseCase.execute(
        String(ctx.chat.id),
      );

      if (debts.length === 0) {
        await ctx.reply('No tenés deudas pendientes.');
        return;
      }

      const lines = debts.map(
        (debt) =>
          `• ${debt.debtorName}: ${debt.amount.toString()} — ${debt.reason} (id: ${debt.id})`,
      );
      await ctx.reply(lines.join('\n'));
    });

    this.bot.command('pagado', async (ctx) => {
      const debtId = this.extractArg(ctx.message.text);
      if (!debtId) {
        await ctx.reply('Usá /pagado <id> (fijate el id con /deudas).');
        return;
      }

      try {
        const debt = await this.markAsPaidUseCase.execute(debtId);
        await ctx.reply(
          `Marcada como pagada: ${debt.debtorName} — ${debt.amount.toString()}.`,
        );
      } catch (error) {
        if (error instanceof DebtNotFoundError) {
          await ctx.reply('No encontré esa deuda.');
          return;
        }
        throw error;
      }
    });

    this.bot.command('borrar', async (ctx) => {
      const debtId = this.extractArg(ctx.message.text);
      if (!debtId) {
        await ctx.reply('Usá /borrar <id> (fijate el id con /deudas).');
        return;
      }

      await this.deleteDebtUseCase.execute(debtId);
      await ctx.reply('Listo, la borré.');
    });

    this.bot.on(message('text'), async (ctx) => {
      try {
        const debt = await this.registerDebtUseCase.execute({
          rawText: ctx.message.text,
          telegramChatId: String(ctx.chat.id),
        });

        await ctx.reply(
          `Anoté: ${debt.debtorName} te debe ${debt.amount.toString()} por "${debt.reason}" ` +
            `(${debt.date.toLocaleDateString('es-AR')}).\n` +
            `Si está mal, borrala con /borrar ${debt.id} y contame de nuevo.`,
        );
      } catch (error) {
        this.logger.error('No se pudo registrar la deuda', error as Error);
        await ctx.reply(
          'No pude entender el mensaje, ¿podés reformularlo con nombre, monto y motivo?',
        );
      }
    });
  }

  private extractArg(text: string): string | undefined {
    return text.split(' ')[1];
  }
}
