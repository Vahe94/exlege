import { Controller, Get, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { PostType } from '@exlege/types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { TenantContextService } from '../tenants/tenant-context.service';
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

/** Consumed by apps/web — published content only, no auth. */
@Public()
@Controller('public/posts')
export class PublicPostsController {
  constructor(
    private readonly posts: PostsService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(publicListQuerySchema)) query: PublicListQuery,
  ): Promise<Paginated<PublicPostListItem>> {
    const tenantId = await this.tenantContext.getDefaultTenantId();
    return this.posts.publicList(tenantId, query);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string): Promise<PublicPostDetail> {
    const tenantId = await this.tenantContext.getDefaultTenantId();
    return this.posts.publicGetBySlug(tenantId, slug);
  }
}
