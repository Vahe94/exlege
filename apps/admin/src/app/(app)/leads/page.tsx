'use client';

import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, formatDate, type Paginated } from '@/lib/api';
import { EmptyRow, Select, Table } from '@/components/ui';

interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

export default function LeadsPage() {
  const t = useTranslations('leads');
  const tc = useTranslations('common');
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api<Paginated<LeadRow>>('/leads?pageSize=50'),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Table
        headers={[t('name'), t('phone'), t('email'), t('message'), t('date'), t('status')]}
      >
        {(data?.items ?? []).map((lead) => (
          <tr key={lead.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{lead.name}</td>
            <td className="px-4 py-3">
              <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                {lead.phone}
              </a>
            </td>
            <td className="px-4 py-3 text-gray-500">{lead.email ?? '—'}</td>
            <td className="max-w-xs truncate px-4 py-3 text-gray-500">{lead.message ?? '—'}</td>
            <td className="px-4 py-3 text-gray-500">{formatDate(lead.createdAt)}</td>
            <td className="px-4 py-3">
              <Select
                value={lead.status}
                onChange={(e) => setStatus.mutate({ id: lead.id, status: e.target.value })}
              >
                {(['NEW', 'CONTACTED', 'CLOSED'] as const).map((s) => (
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
    </div>
  );
}
