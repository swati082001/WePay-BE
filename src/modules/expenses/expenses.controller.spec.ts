import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

describe('ExpensesController', () => {
  let controller: ExpensesController;

  const mockExpensesService = {
    create: jest.fn(),
    findAllByGroup: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toResponse: jest.fn((x) => x),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ExpensesController>(ExpensesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call expensesService.create with dto and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      const dto = { groupId: 'g1', amount: 50, paidBy: 'u1', splitType: 'equal', participantIds: ['u1'] };
      mockExpensesService.create.mockResolvedValue({ _id: 'e1' });
      await controller.create(dto as any, payload);
      expect(mockExpensesService.create).toHaveBeenCalledWith(dto, 'user-id');
      expect(mockExpensesService.toResponse).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call expensesService.findOne with id and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockExpensesService.findOne.mockResolvedValue({ _id: 'e1' });
      await controller.findOne('expense-id', payload);
      expect(mockExpensesService.findOne).toHaveBeenCalledWith('expense-id', 'user-id');
    });
  });

  describe('update', () => {
    it('should call expensesService.update with id, payload.sub and dto', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockExpensesService.update.mockResolvedValue({ _id: 'e1', description: 'Updated' });
      await controller.update('expense-id', { description: 'Updated' } as any, payload);
      expect(mockExpensesService.update).toHaveBeenCalledWith('expense-id', 'user-id', { description: 'Updated' });
    });
  });

  describe('delete', () => {
    it('should call expensesService.delete with id and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockExpensesService.delete.mockResolvedValue(undefined);
      await controller.delete('expense-id', payload);
      expect(mockExpensesService.delete).toHaveBeenCalledWith('expense-id', 'user-id');
    });
  });
});
