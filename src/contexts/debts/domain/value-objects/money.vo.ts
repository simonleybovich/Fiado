export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {}

  static create(amount: number, currency: string): Money {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new Error('El monto debe ser un número válido');
    }
    if (amount < 0) {
      throw new Error('El monto no puede ser negativo');
    }
    if (!currency || !currency.trim()) {
      throw new Error('La moneda es obligatoria');
    }

    return new Money(amount, currency.trim().toUpperCase());
  }

  get value(): number {
    return this.amount;
  }

  get currencyCode(): string {
    return this.currency;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
