import { Debt } from '../../domain/entities/debt.entity';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';

export class DebtNotFoundError extends Error {
  constructor(id: string) {
    super(`No se encontró la deuda con id ${id}`);
  }
}

export class MarkAsPaidUseCase {
  constructor(private readonly repository: DebtRepositoryPort) {}

  async execute(debtId: string): Promise<Debt> {
    const debt = await this.repository.findById(debtId);
    if (!debt) {
      throw new DebtNotFoundError(debtId);
    }

    debt.markAsPaid();
    await this.repository.save(debt);

    return debt;
  }
}
