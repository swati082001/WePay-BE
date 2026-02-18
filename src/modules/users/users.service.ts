import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, PublicUser } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly saltRounds = 12;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.userModel
      .findOne({ email: createUserDto.email.toLowerCase() })
      .exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );
    const user = await this.userModel.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash,
      firstName: createUserDto.firstName ?? null,
      lastName: createUserDto.lastName ?? null,
    });
    return this.toPublicUser(user);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneOrFail(id: string): Promise<PublicUser> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(
        updateUserDto.password,
        this.saltRounds,
      );
    }
    if (updateUserDto.firstName !== undefined) user.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined) user.lastName = updateUserDto.lastName;
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;
    const saved = await user.save();
    return this.toPublicUser(saved);
  }

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  private toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user._id.toHexString(),
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      isActive: user.isActive,
      createdAt: user.createdAt as Date,
      updatedAt: user.updatedAt as Date,
    };
  }
}
