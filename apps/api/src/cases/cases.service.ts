import { Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import type { Case } from '@exlege/db';
import type { CreateCaseInput, UpdateCaseInput } from '@exlege/types';
import { CaseStatus } from '@exlege/types';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';

export const listCasesQuerySchema = z.object({
  status: CaseStatus.optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListCasesQuery = z.infer<typeof listCasesQuerySchema>;

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  create(user: AuthUser, input: CreateCaseInput): Promise<Case> {
    return this.prisma.case.create({
      data: { ...input, tenantId: user.tenantId, createdById: user.userId },
    });
  }

  async list(user: AuthUser, query: ListCasesQuery) {
    const where = {
      tenantId: user.tenantId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { clientName: { contains: query.search, mode: 'insensitive' as const } },
          { number: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { _count: { select: { tasks: true, documents: true } } },
      }),
      this.prisma.case.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getById(user: AuthUser, id: string) {
    const found = await this.prisma.case.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        tasks: { orderBy: [{ dueAt: { sort: 'asc', nulls: 'last' } }] },
        documents: { orderBy: { createdAt: 'desc' } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!found) throw new NotFoundException('Case not found');
    return found;
  }

  async update(user: AuthUser, id: string, input: UpdateCaseInput) {
    await this.getById(user, id);
    return this.prisma.case.update({ where: { id }, data: input });
  }

  async delete(user: AuthUser, id: string) {
    await this.getById(user, id);
    await this.prisma.case.delete({ where: { id } });
    return { ok: true };
  }
}
