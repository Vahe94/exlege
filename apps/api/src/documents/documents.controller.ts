import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import { LocalStorageProvider } from '../storage/local-storage.provider';
import {
  DocumentsService,
  listDocumentsQuerySchema,
  type ListDocumentsQuery,
} from './documents.service';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const uploadBodySchema = z.object({ caseId: z.string().optional() });
type UploadBody = z.infer<typeof uploadBodySchema>;

const downloadQuerySchema = z.object({
  key: z.string().min(1),
  expires: z.coerce.number().int(),
  sig: z.string().min(32),
});
type DownloadQuery = z.infer<typeof downloadQuerySchema>;

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documents: DocumentsService,
    private readonly localStorage: LocalStorageProvider,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Body(new ZodValidationPipe(uploadBodySchema)) body: UploadBody,
  ) {
    return this.documents.upload(user, file, body.caseId);
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(listDocumentsQuerySchema)) query: ListDocumentsQuery,
  ) {
    return this.documents.list(user, query);
  }

  /**
   * Signed download — @Public because auth IS the HMAC signature (expiring, unguessable).
   * Specific to the local storage driver; S3 presigned URLs replace this endpoint later.
   * Declared before :id routes so "download" isn't captured as an id.
   */
  @Public()
  @Get('download')
  async download(
    @Query(new ZodValidationPipe(downloadQuerySchema)) query: DownloadQuery,
    @Res() res: Response,
  ) {
    if (!this.localStorage.verifySignature(query.key, query.expires, query.sig)) {
      throw new BadRequestException('Invalid or expired download link');
    }
    const meta = await this.documents.findByStorageKey(query.key);
    if (!meta) throw new NotFoundException('Document not found');

    const buffer = await this.localStorage.get(query.key);
    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(meta.name)}`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.documents.getById(user, id);
  }

  @Get(':id/url')
  downloadUrl(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.documents.getDownloadUrl(user, id);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN', 'ATTORNEY')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.documents.delete(user, id);
  }
}
