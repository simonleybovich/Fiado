import { Debt } from '../entities/debt.entity';

export const DEBT_REPOSITORY = Symbol('DEBT_REPOSITORY');

export interface DebtRepositoryPort {
  save(debt: Debt): Promise<void>;
  findById(id: string): Promise<Debt | null>;
  findPendingByChat(telegramChatId: string): Promise<Debt[]>;
  deleteById(id: string): Promise<void>;
}
