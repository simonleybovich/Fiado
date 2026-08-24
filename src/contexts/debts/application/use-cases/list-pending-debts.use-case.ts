import { Debt } from '../../domain/entities/debt.entity';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';

export class ListPendingDebtsUseCase {
  constructor(private readonly repository: DebtRepositoryPort) {}

  async execute(telegramChatId: string): Promise<Debt[]> {
    return this.repository.findPendingByChat(telegramChatId);
  }
}
