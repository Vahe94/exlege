import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '@exlege/types';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, input: CreateTaskInput) {
    await this.assertReferencesInTenant(user.tenantId, input);
    if (input.reminderOffsets.length > 0 && !input.dueAt) {
      throw new BadRequestException('reminderOffsets requires dueAt');
    }

    return this.prisma.task.create({
      data: {
        tenantId: user.tenantId,
        title: input.title,
        description: input.description,
        caseId: input.caseId,
        assigneeId: input.assigneeId,
        priority: input.priority,
        dueAt: input.dueAt,
        createdById: user.userId,
        reminders: input.dueAt
          ? {
              create: this.reminderRows(user.tenantId, input.dueAt, input.reminderOffsets),
            }
          : undefined,
      },
      include: { reminders: true, assignee: { select: { id: true, name: true } } },
    });
  }

  async list(user: AuthUser, query: ListTasksQuery) {
    const where = {
      tenantId: user.tenantId,
      ...(query.status && { status: query.status }),
      ...(query.assigneeId && { assigneeId: query.assigneeId }),
      ...(query.caseId && { caseId: query.caseId }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        orderBy: [{ dueAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          assignee: { select: { id: true, name: true } },
          case: { select: { id: true, title: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getById(user: AuthUser, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, tenantId: user.tenantId }, // tenant scoping: id alone is never enough
      include: {
        reminders: true,
        assignee: { select: { id: true, name: true } },
        case: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(user: AuthUser, id: string, input: UpdateTaskInput) {
    const existing = await this.getById(user, id);
    await this.assertReferencesInTenant(user.tenantId, input);

    const dueAt = input.dueAt !== undefined ? input.dueAt : existing.dueAt;
    // Reminders are derived state: when dueAt or offsets change, unsent ones are rebuilt.
    const rebuildReminders = input.dueAt !== undefined || input.reminderOffsets !== undefined;
    if (rebuildReminders && (input.reminderOffsets?.length ?? 0) > 0 && !dueAt) {
      throw new BadRequestException('reminderOffsets requires dueAt');
    }

    return this.prisma.$transaction(async (tx) => {
      if (rebuildReminders) {
        await tx.reminder.deleteMany({ where: { taskId: id, sentAt: null } });
        if (dueAt && input.reminderOffsets?.length) {
          await tx.reminder.createMany({
            data: this.reminderRows(user.tenantId, dueAt, input.reminderOffsets).map((r) => ({
              ...r,
              taskId: id,
            })),
          });
        }
      }
      return tx.task.update({
        where: { id }, // safe: existence within tenant asserted above
        data: {
          title: input.title,
          description: input.description,
          caseId: input.caseId,
          assigneeId: input.assigneeId,
          priority: input.priority,
          dueAt: input.dueAt,
          status: input.status,
          completedAt:
            input.status === 'DONE'
              ? new Date()
              : input.status !== undefined
                ? null
                : undefined,
        },
        include: { reminders: true, assignee: { select: { id: true, name: true } } },
      });
    });
  }

  async delete(user: AuthUser, id: string) {
    await this.getById(user, id); // asserts tenant ownership
    await this.prisma.task.delete({ where: { id } });
    return { ok: true };
  }

  private reminderRows(tenantId: string, dueAt: Date, offsetsMinutes: number[]) {
    return offsetsMinutes.map((minutes) => ({
      tenantId,
      remindAt: new Date(dueAt.getTime() - minutes * 60_000),
    }));
  }

  /** Referenced case/assignee must belong to the caller's tenant. */
  private async assertReferencesInTenant(
    tenantId: string,
    input: Pick<UpdateTaskInput, 'caseId' | 'assigneeId'>,
  ) {
    if (input.caseId) {
      const found = await this.prisma.case.findFirst({
        where: { id: input.caseId, tenantId },
        select: { id: true },
      });
      if (!found) throw new BadRequestException('Unknown case');
    }
    if (input.assigneeId) {
      const member = await this.prisma.membership.findFirst({
        where: { userId: input.assigneeId, tenantId },
        select: { id: true },
      });
      if (!member) throw new BadRequestException('Assignee is not a member of this organization');
    }
  }
}
