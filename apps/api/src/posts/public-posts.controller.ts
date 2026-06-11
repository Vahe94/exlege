import { Controller, Get, Inject, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import { PostType } from '@exlege/types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { TenantContextService } from '../tenants/tenant-context.service';
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage.provider';
import {
  PostsService,
  type Paginated,
  type PublicPostDetail,
  type PublicPostListItem,
} from './posts.service';

const publicListQuerySchema = z.object({
  type: PostType.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});
type PublicListQuery = z.infer<typeof publicListQuerySchema>;

// Image extension → content-type. Storage keys preserve the original extension.
const IMAGE_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  svg: 'image/svg+xml',
};

/** Consumed by apps/web — published content only, no auth. */
@Public()
@Controller('public/posts')
export class PublicPostsController {
  constructor(
    private readonly posts: PostsService,
    private readonly tenantContext: TenantContextService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(publicListQuerySchema)) query: PublicListQuery,
  ): Promise<Paginated<PublicPostListItem>> {
    const tenantId = await this.tenantContext.getDefaultTenantId();
    return this.posts.publicList(tenantId, query);
  }

  /**
   * Public cover image for a published post. Slug-based on purpose: the client never
   * supplies a storage key, so private documents / arbitrary files can't be read.
   * Declared before `:slug` (distinct depth, no collision).
   */
  @Get(':slug/cover')
  async cover(@Param('slug') slug: string, @Res() res: Response): Promise<void> {
    const tenantId = await this.tenantContext.getDefaultTenantId();
    const key = await this.posts.publicCoverKey(tenantId, slug);
    const buffer = await this.storage.get(key);
    const ext = key.split('.').pop()?.toLowerCase() ?? '';
    res.setHeader('Content-Type', IMAGE_MIME[ext] ?? 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.end(buffer);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string): Promise<PublicPostDetail> {
    const tenantId = await this.tenantContext.getDefaultTenantId();
    return this.posts.publicGetBySlug(tenantId, slug);
  }
}
