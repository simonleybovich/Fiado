import { RegisterDebtUseCase } from './register-debt.use-case';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';
import {
  DebtParserPort,
  ParsedDebt,
} from '../../domain/ports/debt-parser.port';

function buildParser(parsed: ParsedDebt): jest.Mocked<DebtParserPort> {
  return { parse: jest.fn().mockResolvedValue(parsed) };
}

function buildRepository(): jest.Mocked<DebtRepositoryPort> {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    findPendingByChat: jest.fn(),
    deleteById: jest.fn(),
  };
}

describe('RegisterDebtUseCase', () => {
  const parsed: ParsedDebt = {
    debtorName: 'Juan',
    amount: 5000,
    currency: 'ars',
    reason: 'Asado del sábado',
    date: '2026-08-22',
  };

  it('parsea el texto, construye la deuda y la persiste', async () => {
    const parser = buildParser(parsed);
    const repository = buildRepository();
    const useCase = new RegisterDebtUseCase(parser, repository);

    const debt = await useCase.execute({
      rawText: 'Juan me debe 5000 pesos del asado del sábado',
      telegramChatId: 'chat-1',
    });

    expect(parser.parse).toHaveBeenCalledWith(
      'Juan me debe 5000 pesos del asado del sábado',
    );
    expect(repository.save).toHaveBeenCalledWith(debt);
    expect(debt.debtorName).toBe('Juan');
    expect(debt.amount.value).toBe(5000);
    expect(debt.amount.currencyCode).toBe('ARS');
    expect(debt.telegramChatId).toBe('chat-1');
    expect(debt.status).toBe('pending');
  });

  it('propaga el error si el parser falla', async () => {
    const parser: jest.Mocked<DebtParserPort> = {
      parse: jest
        .fn()
        .mockRejectedValue(new Error('no se entendió el mensaje')),
    };
    const repository = buildRepository();
    const useCase = new RegisterDebtUseCase(parser, repository);

    await expect(
      useCase.execute({ rawText: 'texto raro', telegramChatId: 'chat-1' }),
    ).rejects.toThrow('no se entendió el mensaje');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('no persiste si el monto parseado es inválido', async () => {
    const parser = buildParser({ ...parsed, amount: -10 });
    const repository = buildRepository();
    const useCase = new RegisterDebtUseCase(parser, repository);

    await expect(
      useCase.execute({ rawText: 'texto', telegramChatId: 'chat-1' }),
    ).rejects.toThrow('no puede ser negativo');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
