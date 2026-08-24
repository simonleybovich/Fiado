import { Money } from './money.vo';

describe('Money', () => {
  it('crea un monto válido normalizando la moneda a mayúsculas', () => {
    const money = Money.create(1500, 'ars');

    expect(money.value).toBe(1500);
    expect(money.currencyCode).toBe('ARS');
  });

  it('permite monto en cero', () => {
    expect(() => Money.create(0, 'ARS')).not.toThrow();
  });

  it('rechaza montos negativos', () => {
    expect(() => Money.create(-100, 'ARS')).toThrow('no puede ser negativo');
  });

  it('rechaza montos no finitos', () => {
    expect(() => Money.create(Number.NaN, 'ARS')).toThrow('número válido');
    expect(() => Money.create(Number.POSITIVE_INFINITY, 'ARS')).toThrow(
      'número válido',
    );
  });

  it('rechaza moneda vacía', () => {
    expect(() => Money.create(100, '')).toThrow('moneda es obligatoria');
    expect(() => Money.create(100, '   ')).toThrow('moneda es obligatoria');
  });

  it('compara igualdad por monto y moneda', () => {
    const a = Money.create(100, 'ARS');
    const b = Money.create(100, 'ars');
    const c = Money.create(100, 'USD');

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('formatea como string', () => {
    expect(Money.create(1500, 'ARS').toString()).toBe('1500 ARS');
  });
});
