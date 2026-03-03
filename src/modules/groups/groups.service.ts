import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { UsersService } from '../users/users.service';
import type { CreateGroupDto } from './dto/create-group.dto';
import type { UpdateGroupDto } from './dto/update-group.dto';
import type { GroupResponse } from './dto/group-response.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(name: string, userId: string): Promise<GroupDocument> {
    const createdBy = new Types.ObjectId(userId);
    const group = await this.groupModel.create({
      name,
      createdBy,
      members: [createdBy],
    });
    return group;
  }

  async findAll(userId: string): Promise<GroupDocument[]> {
    const userObjectId = new Types.ObjectId(userId);
    return this.groupModel
      .find({ members: userObjectId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findById(id).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const userObjectId = new Types.ObjectId(userId);
    const isMember = group.members.some((m) => m.equals(userObjectId));
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }
    return group;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateGroupDto,
  ): Promise<GroupDocument> {
    const group = await this.findOne(id, userId);
    if (Object.keys(dto).length === 0) {
      return group;
    }
    const updated = await this.groupModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Group not found');
    }
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const group = await this.groupModel.findById(id).exec();
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const userObjectId = new Types.ObjectId(userId);
    if (!group.createdBy.equals(userObjectId)) {
      throw new ForbiddenException('Only the group creator can delete the group');
    }
    await this.groupModel.findByIdAndDelete(id).exec();
  }

  async addMembers(
    groupId: string,
    userId: string,
    memberIds: string[],
  ): Promise<GroupDocument> {
    const group = await this.findOne(groupId, userId);
    const existingMemberIds = new Set(
      group.members.map((m) => m.toString()),
    );
    const toAdd: Types.ObjectId[] = [];
    for (const mid of memberIds) {
      if (existingMemberIds.has(mid)) continue;
      const user = await this.usersService.findById(mid);
      if (!user) continue;
      toAdd.push(new Types.ObjectId(mid));
      existingMemberIds.add(mid);
    }
    if (toAdd.length === 0) {
      return group;
    }
    const updated = await this.groupModel
      .findByIdAndUpdate(
        groupId,
        { $addToSet: { members: { $each: toAdd } } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Group not found');
    }
    return updated;
  }

  async removeMember(
    groupId: string,
    userId: string,
    memberIdToRemove: string,
  ): Promise<GroupDocument> {
    const group = await this.findOne(groupId, userId);
    const userObjectId = new Types.ObjectId(userId);
    const removeObjectId = new Types.ObjectId(memberIdToRemove);

    const isRemovingSelf = removeObjectId.equals(userObjectId);
    const isCreator = group.createdBy.equals(userObjectId);

    if (!isRemovingSelf && !isCreator) {
      throw new ForbiddenException(
        'Only the group creator can remove other members',
      );
    }

    const memberIds = group.members.filter((m) => !m.equals(removeObjectId));
    if (memberIds.length === 0) {
      throw new ForbiddenException(
        'Cannot remove the last member. Delete the group instead.',
      );
    }

    const updated = await this.groupModel
      .findByIdAndUpdate(
        groupId,
        { $pull: { members: removeObjectId } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException('Group not found');
    }
    return updated;
  }

  getBalanceSummary(
    _groupId: string,
    _userId: string,
  ): { totalOwed: number; totalOwing: number; netBalance: number } {
    return {
      totalOwed: 0,
      totalOwing: 0,
      netBalance: 0,
    };
  }

  toResponse(group: GroupDocument): GroupResponse {
    return {
      id: group._id.toString(),
      name: group.name,
      createdBy: group.createdBy.toString(),
      members: group.members.map((m) => m.toString()),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      balanceSummary: {
        totalOwed: 0,
        totalOwing: 0,
        netBalance: 0,
      },
    };
  }
}
