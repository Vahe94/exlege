import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { Prisma, type Post } from '@exlege/db';
import { PostStatus, PostType, type UpsertPostInput } from '@exlege/types';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.types';

export const listPostsQuerySchema = z.object({
  type: PostType.optional(),
  status: PostStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

// Explicit return shapes — keep Prisma's non-portable runtime types out of inferred
// signatures (TS2742 across the workspace). Named via the Prisma namespace = portable.
export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: { select: { id: true; name: true } } };
}>;
export type PublicPostListItem = Prisma.PostGetPayload<{
  select: {
    id: true;
    type: true;
    slug: true;
    title: true;
    excerpt: true;
    coverImageKey: true;
    videoUrl: true;
    publishedAt: true;
  };
}>;
export type PublicPostDetail = Prisma.PostGetPayload<{
  select: {
    id: true;
    type: true;
    slug: true;
    title: true;
    excerpt: true;
    content: true;
    coverImageKey: true;
    videoUrl: true;
    publishedAt: true;
  };
}>;

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, input: UpsertPostInput): Promise<Post> {
    try {
      return await this.prisma.post.create({
        data: {
          tenantId: user.tenantId,
          authorId: user.userId,
          type: input.type,
          slug: input.slug,
          title: input.title,
          excerpt: input.excerpt,
          content: input.content as Prisma.InputJsonValue | undefined,
          videoUrl: input.videoUrl,
          coverImageKey: input.coverImageKey,
          status: input.status,
        },
      });
    } catch (e) {
      this.rethrowSlugConflict(e);
    }
  }

  async list(user: AuthUser, query: ListPostsQuery): Promise<Paginated<PostWithAuthor>> {
    const where = {
      tenantId: user.tenantId,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { author: { select: { id: true, name: true } } },
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getById(user: AuthUser, id: string): Promise<PostWithAuthor> {
    const post = await this.prisma.post.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(user: AuthUser, id: string, input: Partial<UpsertPostInput>): Promise<Post> {
    await this.getById(user, id);
    try {
      return await this.prisma.post.update({ where: { id }, data: this.toData(input) });
    } catch (e) {
      this.rethrowSlugConflict(e);
    }
  }

  async publish(user: AuthUser, id: string, publish: boolean): Promise<Post> {
    await this.getById(user, id);
    return this.prisma.post.update({
      where: { id },
      data: publish
        ? { status: 'PUBLISHED', publishedAt: new Date() }
        : { status: 'DRAFT', publishedAt: null },
    });
  }

  async delete(user: AuthUser, id: string) {
    await this.getById(user, id);
    await this.prisma.post.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- public (unauthenticated) ----------

  async publicList(
    tenantId: string,
    query: { type?: PostType; page: number; pageSize: number },
  ): Promise<Paginated<PublicPostListItem>> {
    const where = {
      tenantId,
      status: 'PUBLISHED' as const,
      ...(query.type && { type: query.type }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          type: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImageKey: true,
          videoUrl: true,
          publishedAt: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async publicGetBySlug(tenantId: string, slug: string): Promise<PublicPostDetail> {
    const post = await this.prisma.post.findFirst({
      where: { tenantId, slug, status: 'PUBLISHED' },
      select: {
        id: true,
        type: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        coverImageKey: true,
        videoUrl: true,
        publishedAt: true,
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private toData(input: Partial<UpsertPostInput>) {
    return {
      type: input.type,
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content as Prisma.InputJsonValue | undefined,
      videoUrl: input.videoUrl,
      coverImageKey: input.coverImageKey,
      status: input.status,
    };
  }

  private rethrowSlugConflict(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Slug already in use');
    }
    throw e;
  }
}
