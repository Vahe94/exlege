import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { createLeadSchema, LeadStatus, type CreateLeadInput } from '@exlege/types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { AuthUser } from '../auth/auth.types';
import { TenantContextService } from '../tenants/tenant-context.service';
import { LeadsService, listLeadsQuerySchema, type ListLeadsQuery } from './leads.service';

const updateLeadStatusSchema = z.object({ status: LeadStatus });
type UpdateLeadStatus = z.infer<typeof updateLeadStatusSchema>;

@Controller()
export class LeadsController {
  constructor(
    private readonly leads: LeadsService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /** Public contact/intake form. TODO before prod: rate limiting (@nestjs/throttler). */
  @Public()
  @Post('public/leads')
  async createPublic(@Body(new ZodValidationPipe(createLeadSchema)) input: CreateLeadInput) {
    const tenantId = await this.tenantContext.getDefaultTenantId();
    return this.leads.createPublic(tenantId, input);
  }

  @Get('leads')
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(listLeadsQuerySchema)) query: ListLeadsQuery,
  ) {
    return this.leads.list(user, query);
  }

  @Patch('leads/:id/status')
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLeadStatusSchema)) body: UpdateLeadStatus,
  ) {
    return this.leads.updateStatus(user, id, body.status);
  }
}
