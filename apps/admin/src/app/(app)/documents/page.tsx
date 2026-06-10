'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload, formatBytes, formatDate, API_URL, type Paginated } from '@/lib/api';
import { Button, EmptyRow, Table } from '@/components/ui';

interface DocumentRow {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploadedBy: { id: string; name: string };
  case: { id: string; title: string } | null;
}

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tc = useTranslations('common');
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api<Paginated<DocumentRow>>('/documents?pageSize=50'),
  });

  const upload = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiUpload('/documents', fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  const deleteDoc = useMutation({
    mutationFn: (id: string) => api(`/documents/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });

  async function download(id: string) {
    const { url } = await api<{ url: string }>(`/documents/${id}/url`);
    window.open(`${API_URL}${url}`, '_blank');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate(file);
            e.target.value = '';
          }}
        />
        <Button onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
          {t('upload')}
        </Button>
      </div>

      <Table
        headers={[t('name'), t('case'), t('size'), t('uploadedBy'), t('date'), tc('actions')]}
      >
        {(data?.items ?? []).map((doc) => (
          <tr key={doc.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{doc.name}</td>
            <td className="px-4 py-3 text-gray-500">{doc.case?.title ?? '—'}</td>
            <td className="px-4 py-3 text-gray-500">{formatBytes(doc.sizeBytes)}</td>
            <td className="px-4 py-3 text-gray-500">{doc.uploadedBy.name}</td>
            <td className="px-4 py-3 text-gray-500">{formatDate(doc.createdAt)}</td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <Button variant="ghost" onClick={() => download(doc.id)}>
                  {t('download')}
                </Button>
                <Button variant="ghost" onClick={() => deleteDoc.mutate(doc.id)}>
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
