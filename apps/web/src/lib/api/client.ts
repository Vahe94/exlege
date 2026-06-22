// Base URL includes the `/api` prefix; paths passed in start with `/public/...`.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Server-side GET against the public API with ISR. Throws ApiError on non-2xx. */
export async function apiGet<T>(path: string, opts?: { revalidate?: number }): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: opts?.revalidate ?? 300 },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} -> ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Client-side POST against the public API (no caching). Throws ApiError on non-2xx. */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new ApiError(res.status, `POST ${path} -> ${res.status}`);
  }
  return (await res.json()) as T;
}
