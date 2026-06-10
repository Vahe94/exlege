import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type { Post as PostModel } from '@exlege/db';
import { upsertPostSchema, type UpsertPostInput } from '@exlege/types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import {
  PostsService,
  listPostsQuerySchema,
  type ListPostsQuery,
  type Paginated,
  type PostWithAuthor,
} from './posts.service';

const updatePostSchema = upsertPostSchema.partial();

@Controller('posts')
@Roles('OWNER', 'ADMIN', 'ATTORNEY')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(upsertPostSchema)) input: UpsertPostInput,
  ): Promise<PostModel> {
    return this.posts.create(user, input);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(listPostsQuerySchema)) query: ListPostsQuery,
  ): Promise<Paginated<PostWithAuthor>> {
    return this.posts.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<PostWithAuthor> {
    return this.posts.getById(user, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePostSchema)) input: Partial<UpsertPostInput>,
  ): Promise<PostModel> {
    return this.posts.update(user, id, input);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<PostModel> {
    return this.posts.publish(user, id, true);
  }

  @Post(':id/unpublish')
  unpublish(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<PostModel> {
    return this.posts.publish(user, id, false);
  }

  @Delete(':id')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.posts.delete(user, id);
  }
}
