import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { RemindersProcessor } from './reminders.processor';
import { RemindersScheduler } from './reminders.scheduler';

export const REMINDERS_QUEUE = 'reminders';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get<string>('REDIS_URL') ?? 'redis://localhost:6379');
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            ...(url.password && { password: url.password }),
          },
        };
      },
    }),
    BullModule.registerQueue({ name: REMINDERS_QUEUE }),
  ],
  providers: [RemindersProcessor, RemindersScheduler],
})
export class RemindersModule {}
