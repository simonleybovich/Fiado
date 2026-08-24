import { MarkAsPaidUseCase, DebtNotFoundError } from './mark-as-paid.use-case';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';
import { Debt } from '../../domain/entities/debt.entity';
import { Money } from '../../domain/value-objects/money.vo';

function buildRepository(): jest.Mocked<DebtRepositoryPort> {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    findPendingByChat: jest.fn(),
    deleteById: jest.fn(),
  };
}

function buildDebt(): Debt {
  return Debt.create({
    id: 'debt-1',
    debtorName: 'Juan',
    amount: Money.create(5000, 'ARS'),
    reason: 'Asado',
    date: new Date('2026-08-22'),
    telegramChatId: 'chat-1',
  });
}

describe('MarkAsPaidUseCase', () => {
  it('marca la deuda como pagada y la persiste', async () => {
    const repository = buildRepository();
    const debt = buildDebt();
    repository.findById.mockResolvedValue(debt);
    const useCase = new MarkAsPaidUseCase(repository);

    const result = await useCase.execute('debt-1');

    expect(result.status).toBe('paid');
    expect(repository.save).toHaveBeenCalledWith(debt);
  });

  it('lanza DebtNotFoundError si la deuda no existe', async () => {
    const repository = buildRepository();
    repository.findById.mockResolvedValue(null);
    const useCase = new MarkAsPaidUseCase(repository);

    await expect(useCase.execute('missing')).rejects.toThrow(DebtNotFoundError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
