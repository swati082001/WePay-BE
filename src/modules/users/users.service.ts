import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import type { CreateUserPayload, UserResponse } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}  //dependency injection - db model is injected into the service

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(payload: CreateUserPayload): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: payload.email }).exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const user = await this.userModel.create(payload);
    return user;
  }

  async update(
    id: string,
    updates: Partial<Pick<CreateUserPayload, 'firstName' | 'lastName' | 'avatarUrl'>>,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  toResponse(user: UserDocument): UserResponse {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
