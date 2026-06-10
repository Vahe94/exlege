import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const SCAN_INTERVAL_MS = 60_000;

/** Registers the repeatable scan job. Idempotent across restarts and multiple instances. */
@Injectable()
export class RemindersScheduler implements OnApplicationBootstrap {
  constructor(@InjectQueue('reminders') private readonly queue: Queue) {}

  async onApplicationBootstrap() {
    await this.queue.upsertJobScheduler('reminder-scan', { every: SCAN_INTERVAL_MS });
  }
}
