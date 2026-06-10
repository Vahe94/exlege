import { Injectable, NotFoundException } from '@nestjs/common';
import type { Notification } from '@exlege/db';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    user: AuthUser,
    query: { unreadOnly: boolean; page: number; pageSize: number },
  ): Promise<{ items: Notification[]; total: number; page: number; pageSize: number }> {
    const where = {
      tenantId: user.tenantId,
      userId: user.userId,
      ...(query.unreadOnly && { readAt: null }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async unreadCount(user: AuthUser) {
    const count = await this.prisma.notification.count({
      where: { tenantId: user.tenantId, userId: user.userId, readAt: null },
    });
    return { count };
  }

  async markRead(user: AuthUser, id: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { id, tenantId: user.tenantId, userId: user.userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('Notification not found');
    return { ok: true };
  }

  async markAllRead(user: AuthUser) {
    const { count } = await this.prisma.notification.updateMany({
      where: { tenantId: user.tenantId, userId: user.userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true, marked: count };
  }
}
