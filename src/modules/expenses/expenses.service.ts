import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument, SplitType } from './schemas/expense.schema';
import { GroupsService } from '../groups/groups.service';
import type { CreateExpenseDto } from './dto/create-expense.dto';
import type { UpdateExpenseDto } from './dto/update-expense.dto';
import type { ExpenseResponse } from './dto/expense-response.dto';

const EPS = 1e-6;

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
    private readonly groupsService: GroupsService,
  ) {}

  async create(dto: CreateExpenseDto, userId: string): Promise<ExpenseDocument> {
    const group = await this.groupsService.findOne(dto.groupId, userId);
    const memberIds = new Set(group.members.map((m) => m.toString()));
    const paidByObj = new Types.ObjectId(dto.paidBy);
    if (!memberIds.has(dto.paidBy)) {
      throw new BadRequestException('Payer must be a group member');
    }

    const splits = this.computeSplits(dto, group, memberIds);
    const expense = await this.expenseModel.create({
      description: dto.description ?? '',
      amount: dto.amount,
      groupId: new Types.ObjectId(dto.groupId),
      paidBy: paidByObj,
      splitType: dto.splitType,
      splits,
    });
    return expense;
  }

  private computeSplits(
    dto: CreateExpenseDto,
    group: { members: Types.ObjectId[] },
    memberIds: Set<string>,
  ): { userId: Types.ObjectId; amountOwed: number }[] {
    const amount = dto.amount;

    if (dto.splitType === 'equal') {
      const participantIds = dto.participantIds?.length
        ? dto.participantIds
        : group.members.map((m) => m.toString());
      for (const id of participantIds) {
        if (!memberIds.has(id)) {
          throw new BadRequestException(`User ${id} is not a group member`);
        }
      }
      const n = participantIds.length;
      if (n === 0) {
        throw new BadRequestException('At least one participant required for equal split');
      }
      const each = Math.round((amount / n) * 100) / 100;
      return participantIds.map((id) => ({
        userId: new Types.ObjectId(id),
        amountOwed: each,
      }));
    }

    if (dto.splitType === 'exact') {
      if (!dto.exactSplits?.length) {
        throw new BadRequestException('exactSplits required for exact split type');
      }
      let sum = 0;
      for (const s of dto.exactSplits) {
        if (!memberIds.has(s.userId)) {
          throw new BadRequestException(`User ${s.userId} is not a group member`);
        }
        sum += s.amountOwed;
      }
      if (Math.abs(sum - amount) > EPS) {
        throw new BadRequestException('exactSplits total must equal amount');
      }
      return dto.exactSplits.map((s) => ({
        userId: new Types.ObjectId(s.userId),
        amountOwed: s.amountOwed,
      }));
    }

    if (dto.splitType === 'percentage') {
      if (!dto.percentageSplits?.length) {
        throw new BadRequestException('percentageSplits required for percentage split type');
      }
      let sumPct = 0;
      for (const s of dto.percentageSplits) {
        if (!memberIds.has(s.userId)) {
          throw new BadRequestException(`User ${s.userId} is not a group member`);
        }
        sumPct += s.percentage;
      }
      if (Math.abs(sumPct - 100) > EPS) {
        throw new BadRequestException('percentageSplits must sum to 100');
      }
      return dto.percentageSplits.map((s) => ({
        userId: new Types.ObjectId(s.userId),
        amountOwed: Math.round((amount * (s.percentage / 100)) * 100) / 100,
      }));
    }

    throw new BadRequestException('Invalid splitType');
  }

  async findAllByGroup(groupId: string, userId: string): Promise<ExpenseDocument[]> {
    await this.groupsService.findOne(groupId, userId);
    return this.expenseModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(expenseId: string, userId: string): Promise<ExpenseDocument> {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    await this.groupsService.findOne(expense.groupId.toString(), userId);
    return expense;
  }

  async update(
    expenseId: string,
    userId: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseDocument> {
    const expense = await this.findOne(expenseId, userId);
    if (Object.keys(dto).length === 0) {
      return expense;
    }

    const group = await this.groupsService.findOne(expense.groupId.toString(), userId);
    const memberIds = new Set(group.members.map((m) => m.toString()));

    const description = dto.description !== undefined ? dto.description : expense.description;
    const amount = dto.amount !== undefined ? dto.amount : expense.amount;
    const paidBy = dto.paidBy !== undefined ? new Types.ObjectId(dto.paidBy) : expense.paidBy;
    const splitType = dto.splitType !== undefined ? dto.splitType : expense.splitType;

    if (dto.paidBy !== undefined && !memberIds.has(dto.paidBy)) {
      throw new BadRequestException('Payer must be a group member');
    }

    let splits = expense.splits;
    const createLikeDto: CreateExpenseDto = {
      groupId: expense.groupId.toString(),
      description,
      amount,
      paidBy: paidBy.toString(),
      splitType: splitType as SplitType,
    };
    if (splitType === 'equal') {
      createLikeDto.participantIds = dto.participantIds ?? expense.splits.map((s) => s.userId.toString());
      splits = this.computeSplits(createLikeDto, group, memberIds);
    } else if (splitType === 'exact' && dto.exactSplits?.length) {
      createLikeDto.exactSplits = dto.exactSplits;
      splits = this.computeSplits(createLikeDto, group, memberIds);
    } else if (splitType === 'percentage' && dto.percentageSplits?.length) {
      createLikeDto.percentageSplits = dto.percentageSplits;
      splits = this.computeSplits(createLikeDto, group, memberIds);
    } else if (dto.amount !== undefined || dto.splitType !== undefined) {
      createLikeDto.participantIds = expense.splits.map((s) => s.userId.toString());
      if (splitType === 'exact') {
        createLikeDto.exactSplits = expense.splits.map((s) => ({
          userId: s.userId.toString(),
          amountOwed: s.amountOwed,
        }));
      } else if (splitType === 'percentage') {
        const total = expense.splits.reduce((a, s) => a + s.amountOwed, 0);
        createLikeDto.percentageSplits = expense.splits.map((s) => ({
          userId: s.userId.toString(),
          percentage: total > 0 ? Math.round((s.amountOwed / total) * 10000) / 100 : 0,
        }));
      }
      splits = this.computeSplits(createLikeDto, group, memberIds);
    }

    const updated = await this.expenseModel
      .findByIdAndUpdate(
        expenseId,
        { description, amount, paidBy, splitType, splits },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Expense not found');
    }
    return updated;
  }

  async delete(expenseId: string, userId: string): Promise<void> {
    await this.findOne(expenseId, userId);
    const result = await this.expenseModel.findByIdAndDelete(expenseId).exec();
    if (!result) {
      throw new NotFoundException('Expense not found');
    }
  }

  toResponse(expense: ExpenseDocument): ExpenseResponse {
    return {
      id: expense._id.toString(),
      groupId: expense.groupId.toString(),
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy.toString(),
      splitType: expense.splitType,
      splits: expense.splits.map((s) => ({
        userId: s.userId.toString(),
        amountOwed: s.amountOwed,
      })),
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
