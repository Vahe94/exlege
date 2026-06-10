import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';

const BATCH_SIZE = 100;

/**
 * Every scan: find due, unsent reminders and turn them into in-app notifications.
 * Email/push channels plug in here later (V1 = IN_APP only).
 */
@Processor('reminders')
export class RemindersProcessor extends WorkerHost {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(): Promise<void> {
    const due = await this.prisma.reminder.findMany({
      where: { sentAt: null, remindAt: { lte: new Date() } },
      include: { task: true },
      take: BATCH_SIZE,
      orderBy: { remindAt: 'asc' },
    });

    for (const reminder of due) {
      const { task } = reminder;
      // Task finished before the reminder fired — mark consumed, don't notify.
      if (task.status === 'DONE') {
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { sentAt: new Date() },
        });
        continue;
      }

      const recipientId = task.assigneeId ?? task.createdById;
      await this.prisma.$transaction([
        this.prisma.notification.create({
          data: {
            tenantId: reminder.tenantId,
            userId: recipientId,
            type: 'task.due', // client renders localized text from type + data (i18n rule)
            title: task.title,
            body: task.dueAt ? task.dueAt.toISOString() : null,
            data: { taskId: task.id, dueAt: task.dueAt?.toISOString() ?? null },
          },
        }),
        this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { sentAt: new Date() },
        }),
      ]);
    }

    if (due.length > 0) {
      this.logger.log(`Processed ${due.length} due reminder(s)`);
    }
  }
}
