import { Debt } from './debt.entity';
import { Money } from '../value-objects/money.vo';

function buildDebt(overrides: Partial<Parameters<typeof Debt.create>[0]> = {}) {
  return Debt.create({
    id: 'debt-1',
    debtorName: '  Juan  ',
    amount: Money.create(5000, 'ARS'),
    reason: 'Asado del sábado',
    date: new Date('2026-08-22'),
    telegramChatId: 'chat-1',
    ...overrides,
  });
}

describe('Debt', () => {
  it('crea una deuda pendiente por defecto y recorta el nombre', () => {
    const debt = buildDebt();

    expect(debt.status).toBe('pending');
    expect(debt.isPaid).toBe(false);
    expect(debt.debtorName).toBe('Juan');
    expect(debt.createdAt).toBeInstanceOf(Date);
  });

  it('rechaza nombre de deudor vacío', () => {
    expect(() => buildDebt({ debtorName: '   ' })).toThrow('nombre del deudor');
  });

  it('rechaza deudas sin chat de telegram', () => {
    expect(() => buildDebt({ telegramChatId: '' })).toThrow('chat de Telegram');
  });

  it('marca la deuda como pagada', () => {
    const debt = buildDebt();

    debt.markAsPaid();

    expect(debt.status).toBe('paid');
    expect(debt.isPaid).toBe(true);
  });

  it('no permite pagar dos veces la misma deuda', () => {
    const debt = buildDebt();
    debt.markAsPaid();

    expect(() => debt.markAsPaid()).toThrow('ya está marcada como pagada');
  });

  it('reconstituye una deuda a partir de un snapshot', () => {
    const original = buildDebt();
    const snapshot = original.toSnapshot();

    const reconstituted = Debt.reconstitute(snapshot);

    expect(reconstituted.toSnapshot()).toEqual(snapshot);
  });
});
