import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './schemas/group.schema';
import { UsersService } from '../users/users.service';

describe('GroupsService', () => {
  let service: GroupsService;
  let groupModel: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };
  let usersService: { findById: jest.Mock };

  const userId = new Types.ObjectId().toString();
  const groupId = new Types.ObjectId().toString();
  const mockGroup = {
    _id: new Types.ObjectId(groupId),
    name: 'Test Group',
    createdBy: new Types.ObjectId(userId),
    members: [new Types.ObjectId(userId)],
    createdAt: new Date(),
    updatedAt: new Date(),
    equals: jest.fn(),
  } as any;

  beforeEach(async () => {
    groupModel = {
      create: jest.fn().mockResolvedValue(mockGroup),
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockGroup]) }) }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockGroup) }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...mockGroup, name: 'Updated' }) }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockGroup) }),
    };
    (mockGroup.members as any)[0].equals = jest.fn().mockReturnValue(true);
    (mockGroup.createdBy as any).equals = jest.fn().mockReturnValue(true);

    usersService = {
      findById: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: getModelToken(Group.name), useValue: groupModel },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group with creator as sole member', async () => {
      const result = await service.create('New Group', userId);
      expect(groupModel.create).toHaveBeenCalledWith({
        name: 'New Group',
        createdBy: expect.any(Types.ObjectId),
        members: [expect.any(Types.ObjectId)],
      });
      expect(result).toEqual(mockGroup);
    });
  });

  describe('findAll', () => {
    it('should return groups where user is a member', async () => {
      const result = await service.findAll(userId);
      expect(groupModel.find).toHaveBeenCalledWith({ members: expect.any(Types.ObjectId) });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return group when user is member', async () => {
      const result = await service.findOne(groupId, userId);
      expect(result).toEqual(mockGroup);
    });

    it('should throw NotFoundException when group does not exist', async () => {
      groupModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findOne(groupId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      (mockGroup.members[0].equals as jest.Mock).mockReturnValue(false);
      await expect(service.findOne(groupId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('toResponse', () => {
    it('should map group document to GroupResponse', () => {
      const response = service.toResponse(mockGroup);
      expect(response.id).toBe(mockGroup._id.toString());
      expect(response.name).toBe(mockGroup.name);
      expect(response.createdBy).toBe(mockGroup.createdBy.toString());
      expect(response.members).toHaveLength(1);
      expect(response.balanceSummary).toEqual({ totalOwed: 0, totalOwing: 0, netBalance: 0 });
    });
  });
});
