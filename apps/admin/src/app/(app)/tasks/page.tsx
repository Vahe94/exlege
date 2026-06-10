'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, formatDate, type Paginated } from '@/lib/api';
import { Badge, Button, Card, EmptyRow, Input, Select, Table, Textarea } from '@/components/ui';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueAt: string | null;
  case: { id: string; title: string } | null;
}

interface CaseOption {
  id: string;
  title: string;
}

const statusTone = { TODO: 'gray', IN_PROGRESS: 'blue', DONE: 'green' } as const;
const priorityTone = { LOW: 'gray', MEDIUM: 'blue', HIGH: 'yellow', URGENT: 'red' } as const;

export default function TasksPage() {
  const t = useTranslations('tasks');
  const tc = useTranslations('common');
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { data } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () =>
      api<Paginated<TaskRow>>(`/tasks?pageSize=50${statusFilter ? `&status=${statusFilter}` : ''}`),
  });
  const { data: cases } = useQuery({
    queryKey: ['cases', 'options'],
    queryFn: () => api<Paginated<CaseOption>>('/cases?pageSize=100'),
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    dueAt: '',
    priority: 'MEDIUM',
    caseId: '',
    reminderOffsets: '',
  });

  const createTask = useMutation({
    mutationFn: () =>
      api('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
          priority: form.priority,
          caseId: form.caseId || undefined,
          reminderOffsets: form.reminderOffsets
            ? form.reminderOffsets
                .split(',')
                .map((s) => parseInt(s.trim(), 10))
                .filter((n) => Number.isFinite(n) && n > 0)
            : [],
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        dueAt: '',
        priority: 'MEDIUM',
        caseId: '',
        reminderOffsets: '',
      });
    },
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api(`/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">{t('status')}</option>
            {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
              <option key={s} value={s}>
                {t(`statuses.${s}`)}
              </option>
            ))}
          </Select>
          <Button onClick={() => setShowForm((v) => !v)}>{t('newTask')}</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              createTask.mutate();
            }}
          >
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">{t('taskTitle')}</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">{t('description')}</label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('dueAt')}</label>
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('priority')}</label>
              <Select
                className="w-full"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                  <option key={p} value={p}>
                    {t(`priorities.${p}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('case')}</label>
              <Select
                className="w-full"
                value={form.caseId}
                onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              >
                <option value="">—</option>
                {(cases?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('reminderHint')}</label>
              <Input
                placeholder="60, 1440"
                value={form.reminderOffsets}
                onChange={(e) => setForm({ ...form, reminderOffsets: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={createTask.isPending}>
                {tc('create')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Table
        headers={[t('taskTitle'), t('case'), t('priority'), t('dueAt'), t('status'), tc('actions')]}
      >
        {(data?.items ?? []).map((task) => (
          <tr key={task.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{task.title}</td>
            <td className="px-4 py-3 text-gray-500">{task.case?.title ?? '—'}</td>
            <td className="px-4 py-3">
              <Badge tone={priorityTone[task.priority]}>{t(`priorities.${task.priority}`)}</Badge>
            </td>
            <td className="px-4 py-3 text-gray-500">{formatDate(task.dueAt)}</td>
            <td className="px-4 py-3">
              <Badge tone={statusTone[task.status]}>{t(`statuses.${task.status}`)}</Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                {task.status !== 'DONE' && (
                  <Button
                    variant="ghost"
                    onClick={() => setStatus.mutate({ id: task.id, status: 'DONE' })}
                  >
                    {t('markDone')}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => deleteTask.mutate(task.id)}>
                  {tc('delete')}
                </Button>
              </div>
            </td>
          </tr>
        ))}
        {data && data.items.length === 0 && <EmptyRow colSpan={6} text={tc('empty')} />}
      </Table>
    </div>
  );
}
