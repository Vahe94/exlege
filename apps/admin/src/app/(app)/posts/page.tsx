'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, formatDate, type Paginated } from '@/lib/api';
import { Badge, Button, Card, EmptyRow, Input, Select, Table, Textarea } from '@/components/ui';

interface PostRow {
  id: string;
  type: 'NEWS' | 'CASE_WIN' | 'VIDEO';
  slug: string;
  title: Record<string, string>;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  updatedAt: string;
  author: { id: string; name: string };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export default function PostsPage() {
  const t = useTranslations('posts');
  const tc = useTranslations('common');
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'NEWS',
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    videoUrl: '',
  });

  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api<Paginated<PostRow>>('/posts?pageSize=50'),
  });

  const createPost = useMutation({
    mutationFn: () =>
      api('/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: form.type,
          slug: form.slug || slugify(form.title) || `post-${Date.now()}`,
          title: { hy: form.title },
          excerpt: form.excerpt ? { hy: form.excerpt } : undefined,
          // V1: plain text content per locale; Tiptap rich editor replaces this (see PROGRESS debt)
          content: form.content ? { hy: { text: form.content } } : undefined,
          videoUrl: form.videoUrl || undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      setShowForm(false);
      setForm({ type: 'NEWS', slug: '', title: '', excerpt: '', content: '', videoUrl: '' });
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      api(`/posts/${id}/${publish ? 'publish' : 'unpublish'}`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });

  const deletePost = useMutation({
    mutationFn: (id: string) => api(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{t('newPost')}</Button>
      </div>

      {showForm && (
        <Card>
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              createPost.mutate();
            }}
          >
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('type')}</label>
              <Select
                className="w-full"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {(['NEWS', 'CASE_WIN', 'VIDEO'] as const).map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">{t('slug')}</label>
              <Input
                value={form.slug}
                placeholder={slugify(form.title) || 'my-post'}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">{t('postTitle')}</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">{t('excerpt')}</label>
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-600">{t('content')}</label>
              <Textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            {form.type === 'VIDEO' && (
              <div className="col-span-2">
                <label className="mb-1 block text-sm text-gray-600">{t('videoUrl')}</label>
                <Input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                />
              </div>
            )}
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                {tc('cancel')}
              </Button>
              <Button type="submit" disabled={createPost.isPending}>
                {tc('create')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={[t('postTitle'), t('type'), t('slug'), t('status'), tc('actions')]}>
        {(data?.items ?? []).map((post) => (
          <tr key={post.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium">{post.title.hy ?? post.slug}</td>
            <td className="px-4 py-3">
              <Badge tone="blue">{t(`types.${post.type}`)}</Badge>
            </td>
            <td className="px-4 py-3 text-gray-500">{post.slug}</td>
            <td className="px-4 py-3">
              <Badge tone={post.status === 'PUBLISHED' ? 'green' : 'gray'}>
                {t(`statuses.${post.status}`)}
              </Badge>
              {post.publishedAt && (
                <span className="ml-2 text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  onClick={() =>
                    togglePublish.mutate({ id: post.id, publish: post.status === 'DRAFT' })
                  }
                >
                  {post.status === 'DRAFT' ? t('publish') : t('unpublish')}
                </Button>
                <Button variant="ghost" onClick={() => deletePost.mutate(post.id)}>
                  {tc('delete')}
                </Button>
              </div>
            </td>
          </tr>
        ))}
        {data && data.items.length === 0 && <EmptyRow colSpan={5} text={tc('empty')} />}
      </Table>
    </div>
  );
}
