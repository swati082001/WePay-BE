import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { GroupsService } from './groups.service';
import { ExpensesService } from '../expenses/expenses.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMembersDto } from './dto/add-members.dto';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly expensesService: ExpensesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a group' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({ status: 201, description: 'Group created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() dto: CreateGroupDto, @CurrentUser() payload: JwtPayload) {
    const group = await this.groupsService.create(dto.name, payload.sub);
    return this.groupsService.toResponse(group);
  }

  @Get()
  @ApiOperation({ summary: 'List groups for the current user' })
  @ApiResponse({ status: 200, description: 'List of groups' })
  async findAll(@CurrentUser() payload: JwtPayload) {
    const groups = await this.groupsService.findAll(payload.sub);
    return groups.map((g) => this.groupsService.toResponse(g));
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'List expenses for a group' })
  @ApiResponse({ status: 200, description: 'List of expenses' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  async findExpensesByGroup(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    const expenses = await this.expensesService.findAllByGroup(id, payload.sub);
    return expenses.map((e) => this.expensesService.toResponse(e));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by ID' })
  @ApiResponse({ status: 200, description: 'Group details' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  async findOne(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    const group = await this.groupsService.findOne(id, payload.sub);
    return this.groupsService.toResponse(group);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiBody({ type: UpdateGroupDto })
  @ApiResponse({ status: 200, description: 'Group updated' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    const group = await this.groupsService.update(id, payload.sub, dto);
    return this.groupsService.toResponse(group);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a group (creator only)' })
  @ApiResponse({ status: 204, description: 'Group deleted' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Only creator can delete' })
  async delete(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() payload: JwtPayload,
  ): Promise<void> {
    await this.groupsService.delete(id, payload.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add members to a group' })
  @ApiBody({ type: AddMembersDto })
  @ApiResponse({ status: 200, description: 'Members added' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  async addMembers(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: AddMembersDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    const group = await this.groupsService.addMembers(
      id,
      payload.sub,
      dto.memberIds,
    );
    return this.groupsService.toResponse(group);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member or leave group (memberId = self to leave)' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeMember(
    @Param('id', ParseMongoIdPipe) id: string,
    @Param('memberId', ParseMongoIdPipe) memberId: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    const group = await this.groupsService.removeMember(
      id,
      payload.sub,
      memberId,
    );
    return this.groupsService.toResponse(group);
  }
}
