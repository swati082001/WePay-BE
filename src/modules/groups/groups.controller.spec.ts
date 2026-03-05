import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { ExpensesService } from '../expenses/expenses.service';

describe('GroupsController', () => {
  let controller: GroupsController;

  const mockGroupsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addMembers: jest.fn(),
    removeMember: jest.fn(),
    toResponse: jest.fn((x) => x),
  };

  const mockExpensesService = {
    findAllByGroup: jest.fn().mockResolvedValue([]),
    toResponse: jest.fn((x) => x),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GroupsController>(GroupsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call groupsService.create with dto.name and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockGroupsService.create.mockResolvedValue({ _id: 'g1', name: 'G' });
      await controller.create({ name: 'My Group' } as any, payload);
      expect(mockGroupsService.create).toHaveBeenCalledWith('My Group', 'user-id');
      expect(mockGroupsService.toResponse).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call groupsService.findAll with payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockGroupsService.findAll.mockResolvedValue([]);
      await controller.findAll(payload);
      expect(mockGroupsService.findAll).toHaveBeenCalledWith('user-id');
    });
  });

  describe('findExpensesByGroup', () => {
    it('should call expensesService.findAllByGroup with id and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockExpensesService.findAllByGroup.mockResolvedValue([]);
      const result = await controller.findExpensesByGroup('group-id', payload);
      expect(mockExpensesService.findAllByGroup).toHaveBeenCalledWith('group-id', 'user-id');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should call groupsService.findOne with id and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockGroupsService.findOne.mockResolvedValue({ _id: 'g1' });
      await controller.findOne('group-id', payload);
      expect(mockGroupsService.findOne).toHaveBeenCalledWith('group-id', 'user-id');
    });
  });

  describe('update', () => {
    it('should call groupsService.update with id, payload.sub and dto', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockGroupsService.update.mockResolvedValue({ _id: 'g1', name: 'Updated' });
      await controller.update('group-id', { name: 'Updated' } as any, payload);
      expect(mockGroupsService.update).toHaveBeenCalledWith('group-id', 'user-id', { name: 'Updated' });
    });
  });

  describe('delete', () => {
    it('should call groupsService.delete with id and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockGroupsService.delete.mockResolvedValue(undefined);
      await controller.delete('group-id', payload);
      expect(mockGroupsService.delete).toHaveBeenCalledWith('group-id', 'user-id');
    });
  });

  describe('addMembers', () => {
    it('should call groupsService.addMembers with id, payload.sub and memberIds', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockGroupsService.addMembers.mockResolvedValue({ _id: 'g1', members: [] });
      await controller.addMembers('group-id', { memberIds: ['m1', 'm2'] } as any, payload);
      expect(mockGroupsService.addMembers).toHaveBeenCalledWith('group-id', 'user-id', ['m1', 'm2']);
    });
  });

  describe('removeMember', () => {
    it('should call groupsService.removeMember with id, memberId and payload.sub', async () => {
      const payload = { sub: 'user-id', email: 'u@e.com' };
      mockGroupsService.removeMember.mockResolvedValue({ _id: 'g1', members: [] });
      await controller.removeMember('group-id', 'member-id', payload);
      expect(mockGroupsService.removeMember).toHaveBeenCalledWith('group-id', 'user-id', 'member-id');
    });
  });
});
