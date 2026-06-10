/**
 * RULE (CLAUDE.md): all file access goes through this interface.
 * V1 driver = local disk. S3/Spaces later = new implementation, zero call-site changes.
 */
export interface StorageProvider {
  /** Persist a file, returns the storage key */
  save(params: { tenantId: string; filename: string; buffer: Buffer; mimeType: string }): Promise<string>;
  /** Read file contents by key */
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  /** Short-lived signed download URL (local driver: signed API route) */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
