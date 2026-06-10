'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api, formatDate, type Paginated } from '@/lib/api';
import { Badge, Card } from '@/components/ui';

interface TaskRow {
  id: string;
  title: string;
  dueAt: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tt = useTranslations('tasks');
  const tc = useTranslations('common');

  const { data: tasks } = useQuery({
    queryKey: ['tasks', 'todo'],
    queryFn: () => api<Paginated<TaskRow>>('/tasks?status=TODO&pageSize=8'),
  });
  const { data: leads } = useQuery({
    queryKey: ['leads', 'new'],
    queryFn: () => api<Paginated<unknown>>('/leads?status=NEW&pageSize=1'),
  });
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api<{ count: number }>('/notifications/unread-count'),
  });

  const priorityTone = { LOW: 'gray', MEDIUM: 'blue', HIGH: 'yellow', URGENT: 'red' } as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-500">{t('openTasks')}</div>
          <div className="mt-1 text-3xl font-bold">{tasks?.total ?? '—'}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">{t('newLeads')}</div>
          <div className="mt-1 text-3xl font-bold">{leads?.total ?? '—'}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">{t('unreadNotifications')}</div>
          <div className="mt-1 text-3xl font-bold">{unread?.count ?? '—'}</div>
        </Card>
      </div>
      <Card>
        <h2 className="mb-3 font-semibold">{t('upcomingDeadlines')}</h2>
        <div className="space-y-2">
          {(tasks?.items ?? []).map((task) => (
            <Link
              key={task.id}
              href="/tasks"
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-50"
            >
              <span className="text-sm">{task.title}</span>
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <Badge tone={priorityTone[task.priority]}>{tt(`priorities.${task.priority}`)}</Badge>
                {formatDate(task.dueAt)}
              </span>
            </Link>
          ))}
          {tasks && tasks.items.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-400">{tc('empty')}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
