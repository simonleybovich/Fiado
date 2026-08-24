import { Money } from '../value-objects/money.vo';

export type DebtStatus = 'pending' | 'paid';

export interface DebtProps {
  id: string;
  debtorName: string;
  amount: Money;
  reason: string;
  date: Date;
  status: DebtStatus;
  telegramChatId: string;
  createdAt: Date;
}

export type NewDebtProps = Omit<DebtProps, 'status' | 'createdAt'> &
  Partial<Pick<DebtProps, 'status' | 'createdAt'>>;

export class Debt {
  private constructor(private readonly props: DebtProps) {}

  static create(props: NewDebtProps): Debt {
    if (!props.debtorName || !props.debtorName.trim()) {
      throw new Error('El nombre del deudor no puede estar vacío');
    }
    if (!props.telegramChatId) {
      throw new Error('La deuda debe estar asociada a un chat de Telegram');
    }

    return new Debt({
      ...props,
      debtorName: props.debtorName.trim(),
      status: props.status ?? 'pending',
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static reconstitute(props: DebtProps): Debt {
    return new Debt(props);
  }

  get id(): string {
    return this.props.id;
  }

  get debtorName(): string {
    return this.props.debtorName;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get reason(): string {
    return this.props.reason;
  }

  get date(): Date {
    return this.props.date;
  }

  get status(): DebtStatus {
    return this.props.status;
  }

  get telegramChatId(): string {
    return this.props.telegramChatId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isPaid(): boolean {
    return this.props.status === 'paid';
  }

  markAsPaid(): void {
    if (this.props.status === 'paid') {
      throw new Error('La deuda ya está marcada como pagada');
    }
    this.props.status = 'paid';
  }

  toSnapshot(): DebtProps {
    return { ...this.props };
  }
}
