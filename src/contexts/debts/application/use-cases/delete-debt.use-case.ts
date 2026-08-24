import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';

export class DeleteDebtUseCase {
  constructor(private readonly repository: DebtRepositoryPort) {}

  async execute(debtId: string): Promise<void> {
    await this.repository.deleteById(debtId);
  }
}
