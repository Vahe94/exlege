import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage.provider';
import type { AuthUser } from '../auth/auth.types';

export const listDocumentsQuerySchema = z.object({
  caseId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async upload(user: AuthUser, file: Express.Multer.File, caseId?: string) {
    if (caseId) {
      const found = await this.prisma.case.findFirst({
        where: { id: caseId, tenantId: user.tenantId },
        select: { id: true },
      });
      if (!found) throw new BadRequestException('Unknown case');
    }

    const storageKey = await this.storage.save({
      tenantId: user.tenantId,
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    return this.prisma.document.create({
      data: {
        tenantId: user.tenantId,
        caseId,
        name: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey,
        uploadedById: user.userId,
      },
    });
  }

  async list(user: AuthUser, query: ListDocumentsQuery) {
    const where = { tenantId: user.tenantId, ...(query.caseId && { caseId: query.caseId }) };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          uploadedBy: { select: { id: true, name: true } },
          case: { select: { id: true, title: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getById(user: AuthUser, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  /** Expiring signed URL — the only way documents are ever served (CLAUDE.md rule). */
  async getDownloadUrl(user: AuthUser, id: string) {
    const doc = await this.getById(user, id);
    const url = await this.storage.getSignedUrl(doc.storageKey, 300);
    return { url, expiresInSeconds: 300, name: doc.name, mimeType: doc.mimeType };
  }

  async delete(user: AuthUser, id: string) {
    const doc = await this.getById(user, id);
    await this.prisma.document.delete({ where: { id: doc.id } });
    await this.storage.delete(doc.storageKey); // after DB delete: orphan file beats dangling row
    return { ok: true };
  }

  /** For the public signed-download endpoint: resolve metadata by storage key. */
  findByStorageKey(storageKey: string) {
    return this.prisma.document.findUnique({ where: { storageKey } });
  }
}
