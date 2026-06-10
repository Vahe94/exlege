'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, formatDate, type Paginated } from '@/lib/api';
import { Badge, Button, Card, EmptyRow, Input, Select, Table, Textarea } from '@/components/ui';

interface CaseRow {
  id: string;
  title: string;
  number: string | null;
  clientName: string | null;
  status: 'OPEN' | 'ON_HOLD' | 'CLOSED';
  createdAt: string;
  _count: { tasks: number; documents: number };
}

const statusTone = { OPEN: 'green', ON_HOLD: 'yellow', CLOSED: 'gray' } as const;

export default function CasesPage() {
  const t = useTranslations('cases');
  const tc = useTranslations('common');
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', number: '', clientName: '', description: '' });

  const { data } = useQuery({
    queryKey: ['cases', search],
    queryFn: () =>
      api<Paginated<CaseRow>>(
        `/cases?pageSize=50${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      ),
  });

  const createCase = useMutation({
    mutationFn: () =>
      api('/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          number: form.number || undefined,
          clientName: form.clientName || undefined,
          description: form.description || undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases'] });
      setShowForm(false);
      setForm({ title: '', number: '', clientName: '', description: '' });
    },
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/cases/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cases'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Input
            placeholder={tc('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button onClick={() => setShowForm((v) => !v)}>{t('newCase')}</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              createCase.mutate();
            }}
          >
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('caseTitle')}</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('number')}</label>
              <Input
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">{t('clientName')}</label>
              <Input
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">{t('description')}</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={createCase.isPending}>
                {tc('create')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Table
        headers={[
          t('caseTitle'),
          t('number'),
          t('clientName'),
          t('tasksCount'),
          t('documentsCount'),
          t('status'),
        ]}
      >
        {(data?.items ?? []).map((c) => (
          <tr key={c.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{c.title}</td>
            <td className="px-4 py-3 text-gray-500">{c.number ?? '—'}</td>
            <td className="px-4 py-3 text-gray-500">{c.clientName ?? '—'}</td>
            <td className="px-4 py-3">{c._count.tasks}</td>
            <td className="px-4 py-3">{c._count.documents}</td>
            <td className="px-4 py-3">
              <Select
                value={c.status}
                onChange={(e) => setStatus.mutate({ id: c.id, status: e.target.value })}
              >
                {(['OPEN', 'ON_HOLD', 'CLOSED'] as const).map((s) => (
                  <option key={s} value={s}>
                    {t(`statuses.${s}`)}
                  </option>
                ))}
              </Select>
            </td>
          </tr>
        ))}
        {data && data.items.length === 0 && <EmptyRow colSpan={6} text={tc('empty')} />}
      </Table>
      {data && (
        <p className="text-sm text-gray-500">{tc('total', { count: data.total })}</p>
      )}
    </div>
  );
}
