import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Expense } from './schemas/expense.schema';
import { GroupsService } from '../groups/groups.service';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseModel: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };
  let groupsService: { findOne: jest.Mock };

  const userId = new Types.ObjectId().toString();
  const groupId = new Types.ObjectId().toString();
  const expenseId = new Types.ObjectId().toString();
  const mockGroup = {
    _id: new Types.ObjectId(groupId),
    members: [new Types.ObjectId(userId), new Types.ObjectId()],
  } as any;
  const mockExpense = {
    _id: new Types.ObjectId(expenseId),
    groupId: new Types.ObjectId(groupId),
    description: 'Lunch',
    amount: 100,
    paidBy: new Types.ObjectId(userId),
    splitType: 'equal',
    splits: [
      { userId: new Types.ObjectId(userId), amountOwed: 50 },
      { userId: mockGroup.members[1], amountOwed: 50 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    expenseModel = {
      create: jest.fn().mockResolvedValue(mockExpense),
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockExpense]) }) }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockExpense) }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...mockExpense, description: 'Updated' }) }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockExpense) }),
    };
    groupsService = {
      findOne: jest.fn().mockResolvedValue(mockGroup),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getModelToken(Expense.name), useValue: expenseModel },
        { provide: GroupsService, useValue: groupsService },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create expense with equal split', async () => {
      const dto = {
        groupId,
        amount: 100,
        paidBy: userId,
        splitType: 'equal' as const,
        participantIds: [userId, mockGroup.members[1].toString()],
      };
      const result = await service.create(dto, userId);
      expect(groupsService.findOne).toHaveBeenCalledWith(groupId, userId);
      expect(expenseModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findAllByGroup', () => {
    it('should return expenses for group when user is member', async () => {
      const result = await service.findAllByGroup(groupId, userId);
      expect(groupsService.findOne).toHaveBeenCalledWith(groupId, userId);
      expect(expenseModel.find).toHaveBeenCalledWith({ groupId: expect.any(Types.ObjectId) });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return expense when user is group member', async () => {
      const result = await service.findOne(expenseId, userId);
      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException when expense does not exist', async () => {
      expenseModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findOne(expenseId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toResponse', () => {
    it('should map expense to response', () => {
      const response = service.toResponse(mockExpense);
      expect(response.id).toBe(mockExpense._id.toString());
      expect(response.groupId).toBe(groupId);
      expect(response.description).toBe('Lunch');
      expect(response.amount).toBe(100);
      expect(response.splits).toHaveLength(2);
    });
  });
});
