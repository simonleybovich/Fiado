import { Model } from 'mongoose';
import { Debt } from '../../domain/entities/debt.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { DebtRepositoryPort } from '../../domain/ports/debt-repository.port';
import { DebtDocument, DebtSchemaClass } from './debt.schema';

export class MongoDebtRepository implements DebtRepositoryPort {
  constructor(private readonly model: Model<DebtDocument>) {}

  async save(debt: Debt): Promise<void> {
    const snapshot = debt.toSnapshot();

    await this.model
      .updateOne(
        { id: snapshot.id },
        {
          $set: {
            id: snapshot.id,
            debtorName: snapshot.debtorName,
            amount: snapshot.amount.value,
            currency: snapshot.amount.currencyCode,
            reason: snapshot.reason,
            date: snapshot.date,
            status: snapshot.status,
            telegramChatId: snapshot.telegramChatId,
            createdAt: snapshot.createdAt,
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async findById(id: string): Promise<Debt | null> {
    const doc = await this.model.findOne({ id }).lean().exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findPendingByChat(telegramChatId: string): Promise<Debt[]> {
    const docs = await this.model
      .find({ telegramChatId, status: 'pending' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  private toDomain(doc: DebtSchemaClass): Debt {
    return Debt.reconstitute({
      id: doc.id,
      debtorName: doc.debtorName,
      amount: Money.create(doc.amount, doc.currency),
      reason: doc.reason,
      date: doc.date,
      status: doc.status,
      telegramChatId: doc.telegramChatId,
      createdAt: doc.createdAt,
    });
  }
}
