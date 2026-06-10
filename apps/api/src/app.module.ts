import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { TasksModule } from './tasks/tasks.module';
import { RemindersModule } from './reminders/reminders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CasesModule } from './cases/cases.module';
import { DocumentsModule } from './documents/documents.module';
import { PostsModule } from './posts/posts.module';
import { LeadsModule } from './leads/leads.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    PrismaModule,
    StorageModule,
    TenantsModule,
    AuthModule,
    TasksModule,
    RemindersModule,
    NotificationsModule,
    CasesModule,
    DocumentsModule,
    PostsModule,
    LeadsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
