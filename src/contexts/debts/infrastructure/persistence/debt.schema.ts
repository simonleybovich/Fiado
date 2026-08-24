import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { DebtStatus } from '../../domain/entities/debt.entity';

export type DebtDocument = HydratedDocument<DebtSchemaClass>;

@Schema({ collection: 'debts' })
export class DebtSchemaClass {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  debtorName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  date: Date;

  @Prop({
    required: true,
    enum: ['pending', 'paid'],
    default: 'pending',
    index: true,
  })
  status: DebtStatus;

  @Prop({ required: true, index: true })
  telegramChatId: string;

  @Prop({ required: true })
  createdAt: Date;
}

export const DebtSchema = SchemaFactory.createForClass(DebtSchemaClass);
