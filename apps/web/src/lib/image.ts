import { API_URL } from './api/client';

/**
 * Public cover image URL for a published post. The API serves bytes by slug
 * (never by raw storage key), so this only needs the post's slug.
 */
export function coverUrl(slug: string): string {
  return `${API_URL}/public/posts/${encodeURIComponent(slug)}/cover`;
}
