import type { Paginated, PostType, PublicPostDetail, PublicPostListItem } from '@exlege/types';
import { apiGet } from './client';

export function getPublicPosts(
  params: { type?: PostType; page?: number; pageSize?: number } = {},
): Promise<Paginated<PublicPostListItem>> {
  const q = new URLSearchParams();
  if (params.type) q.set('type', params.type);
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  const qs = q.toString();
  return apiGet<Paginated<PublicPostListItem>>(`/public/posts${qs ? `?${qs}` : ''}`);
}

export function getPublicPost(slug: string): Promise<PublicPostDetail> {
  return apiGet<PublicPostDetail>(`/public/posts/${encodeURIComponent(slug)}`);
}
