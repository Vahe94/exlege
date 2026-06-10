import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  createCaseSchema,
  updateCaseSchema,
  type CreateCaseInput,
  type UpdateCaseInput,
} from '@exlege/types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import { CasesService, listCasesQuerySchema, type ListCasesQuery } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly cases: CasesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createCaseSchema)) input: CreateCaseInput,
  ) {
    return this.cases.create(user, input);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(listCasesQuerySchema)) query: ListCasesQuery,
  ) {
    return this.cases.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cases.getById(user, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCaseSchema)) input: UpdateCaseInput,
  ) {
    return this.cases.update(user, id, input);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cases.delete(user, id);
  }
}
