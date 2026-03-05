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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'))
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an expense' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({ status: 201, description: 'Expense created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Not a group member' })
  async create(@Body() dto: CreateExpenseDto, @CurrentUser() payload: JwtPayload) {
    const expense = await this.expensesService.create(dto, payload.sub);
    return this.expensesService.toResponse(expense);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense details' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 403, description: 'Not a group member' })
  async findOne(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() payload: JwtPayload,
  ) {
    const expense = await this.expensesService.findOne(id, payload.sub);
    return this.expensesService.toResponse(expense);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiResponse({ status: 200, description: 'Expense updated' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 403, description: 'Not a group member' })
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    const expense = await this.expensesService.update(id, payload.sub, dto);
    return this.expensesService.toResponse(expense);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 204, description: 'Expense deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 403, description: 'Not a group member' })
  async delete(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() payload: JwtPayload,
  ): Promise<void> {
    await this.expensesService.delete(id, payload.sub);
  }
}
