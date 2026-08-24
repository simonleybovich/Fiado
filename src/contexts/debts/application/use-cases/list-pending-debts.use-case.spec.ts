import { ListPendingDebtsUseCase } from './list-pending-debts.use-case';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';
import { Debt } from '../../domain/entities/debt.entity';
import { Money } from '../../domain/value-objects/money.vo';

function buildRepository(): jest.Mocked<DebtRepositoryPort> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findPendingByChat: jest.fn(),
    deleteById: jest.fn(),
  };
}

describe('ListPendingDebtsUseCase', () => {
  it('devuelve las deudas pendientes del chat', async () => {
    const repository = buildRepository();
    const debt = Debt.create({
      id: 'debt-1',
      debtorName: 'Juan',
      amount: Money.create(5000, 'ARS'),
      reason: 'Asado',
      date: new Date('2026-08-22'),
      telegramChatId: 'chat-1',
    });
    repository.findPendingByChat.mockResolvedValue([debt]);
    const useCase = new ListPendingDebtsUseCase(repository);

    const result = await useCase.execute('chat-1');

    expect(repository.findPendingByChat).toHaveBeenCalledWith('chat-1');
    expect(result).toEqual([debt]);
  });
});
