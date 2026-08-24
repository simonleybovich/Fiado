import { DeleteDebtUseCase } from './delete-debt.use-case';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';

function buildRepository(): jest.Mocked<DebtRepositoryPort> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findPendingByChat: jest.fn(),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };
}

describe('DeleteDebtUseCase', () => {
  it('elimina la deuda por id', async () => {
    const repository = buildRepository();
    const useCase = new DeleteDebtUseCase(repository);

    await useCase.execute('debt-1');

    expect(repository.deleteById).toHaveBeenCalledWith('debt-1');
  });
});
