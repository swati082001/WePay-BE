import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}    //dependency injection

  @Get('me')
  async getMe(@CurrentUser() payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      return null;
    }
    return this.usersService.toResponse(user);
  }

  @Patch('me')
  async updateMe(@CurrentUser() payload: JwtPayload, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(payload.sub, dto);
    return this.usersService.toResponse(user);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() payload: JwtPayload): Promise<void> {
    await this.usersService.delete(payload.sub);
  }
}
