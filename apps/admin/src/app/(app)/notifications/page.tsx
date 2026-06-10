'use client';

import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, formatDate, type Paginated } from '@/lib/api';
import { Button, Card } from '@/components/ui';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  data: { taskId?: string; dueAt?: string | null };
}

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const tc = useTranslations('common');
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => api<Paginated<NotificationRow>>('/notifications?pageSize=50'),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => api(`/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => api('/notifications/read-all', { method: 'POST' }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button variant="secondary" onClick={() => markAllRead.mutate()}>
          {t('markAllRead')}
        </Button>
      </div>
      <div className="space-y-2">
        {(data?.items ?? []).map((n) => (
          <Card
            key={n.id}
            className={`flex items-center justify-between ${n.readAt ? 'opacity-60' : ''}`}
          >
            <div>
              <div className="text-sm font-medium">
                {n.type === 'task.due' ? t('taskDue') : n.type}
              </div>
              <div className="text-sm text-gray-600">{n.title}</div>
              <div className="mt-1 text-xs text-gray-400">
                {formatDate(n.createdAt)}
                {n.data.dueAt ? ` → ${formatDate(n.data.dueAt)}` : ''}
              </div>
            </div>
            {!n.readAt && (
              <Button variant="ghost" onClick={() => markRead.mutate(n.id)}>
                {t('markRead')}
              </Button>
            )}
          </Card>
        ))}
        {data && data.items.length === 0 && (
          <p className="py-8 text-center text-gray-400">{tc('empty')}</p>
        )}
      </div>
    </div>
  );
}
