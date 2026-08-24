import { randomUUID } from 'crypto';
import { Debt } from '../../domain/entities/debt.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';
import { DebtParserPort } from '../../domain/ports/debt-parser.port';

export interface RegisterDebtInput {
  rawText: string;
  telegramChatId: string;
}

export class RegisterDebtUseCase {
  constructor(
    private readonly parser: DebtParserPort,
    private readonly repository: DebtRepositoryPort,
  ) {}

  async execute(input: RegisterDebtInput): Promise<Debt> {
    const parsed = await this.parser.parse(input.rawText);

    const debt = Debt.create({
      id: randomUUID(),
      debtorName: parsed.debtorName,
      amount: Money.create(parsed.amount, parsed.currency),
      reason: parsed.reason,
      date: new Date(parsed.date),
      telegramChatId: input.telegramChatId,
    });

    await this.repository.save(debt);

    return debt;
  }
}
