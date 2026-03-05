import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

export const SPLIT_TYPES = ['equal', 'exact', 'percentage'] as const;
export type SplitType = (typeof SPLIT_TYPES)[number];

@Schema({ _id: false })
export class ExpenseSplit {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amountOwed: number;
}

export const ExpenseSplitSchema = SchemaFactory.createForClass(ExpenseSplit);

@Schema({ timestamps: true, toJSON: { virtuals: true }, collection: 'expenses' })
export class Expense {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Group', index: true })
  groupId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  paidBy: Types.ObjectId;

  @Prop({ required: true, type: String, enum: SPLIT_TYPES })
  splitType: SplitType;

  @Prop({ required: true, type: [ExpenseSplitSchema], default: [] })
  splits: { userId: Types.ObjectId; amountOwed: number }[];

  createdAt: Date;
  updatedAt: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ groupId: 1, createdAt: -1 });
