import { createHmac, randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StorageProvider } from './storage.provider';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly root: string;
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.root = config.get<string>('STORAGE_LOCAL_PATH') ?? './storage/uploads';
    this.secret = config.getOrThrow<string>('JWT_SECRET');
  }

  private resolve(key: string): string {
    const path = normalize(join(this.root, key));
    if (!path.startsWith(normalize(this.root))) {
      throw new Error('Path traversal attempt blocked');
    }
    return path;
  }

  async save(params: {
    tenantId: string;
    filename: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<string> {
    const ext = params.filename.includes('.') ? params.filename.split('.').pop() : 'bin';
    // key is tenant-prefixed and unguessable; original filename lives in DB only
    const key = `${params.tenantId}/${randomUUID()}.${ext}`;
    const path = this.resolve(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, params.buffer);
    return key;
  }

  async get(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    await unlink(this.resolve(key));
  }

  async getSignedUrl(key: string, expiresInSeconds = 300): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signature = createHmac('sha256', this.secret).update(`${key}:${expires}`).digest('hex');
    return `/api/documents/download?key=${encodeURIComponent(key)}&expires=${expires}&sig=${signature}`;
  }

  /** Used by the download endpoint to validate signed URLs */
  verifySignature(key: string, expires: number, sig: string): boolean {
    if (expires < Math.floor(Date.now() / 1000)) return false;
    const expected = createHmac('sha256', this.secret).update(`${key}:${expires}`).digest('hex');
    return sig === expected;
  }
}
