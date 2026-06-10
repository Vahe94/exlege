import { Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { LeadStatus, type CreateLeadInput } from '@exlege/types';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';

export const listLeadsQuerySchema = z.object({
  status: LeadStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public submission — tenantId comes from server-side resolution, never the client. */
  createPublic(
    tenantId: string,
    input: CreateLeadInput,
    source = 'contact_form',
  ): Promise<{ id: string; createdAt: Date }> {
    return this.prisma.lead.create({
      data: { ...input, tenantId, source },
      select: { id: true, createdAt: true }, // don't echo internals to anonymous callers
    });
  }

  async list(user: AuthUser, query: ListLeadsQuery) {
    const where = { tenantId: user.tenantId, ...(query.status && { status: query.status }) };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.lead.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async updateStatus(user: AuthUser, id: string, status: LeadStatus) {
    const { count } = await this.prisma.lead.updateMany({
      where: { id, tenantId: user.tenantId },
      data: { status },
    });
    if (count === 0) throw new NotFoundException('Lead not found');
    return { ok: true };
  }
}
