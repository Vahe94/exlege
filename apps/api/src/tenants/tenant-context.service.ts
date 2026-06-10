import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

/**
 * V1 single-tenant simplification: public (unauthenticated) endpoints resolve
 * the tenant from DEFAULT_TENANT_SLUG. The multi-tenant phase replaces this
 * with host→tenant resolution (Vercel Platforms pattern) — same interface.
 */
@Injectable()
export class TenantContextService {
  private cachedId: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getDefaultTenantId(): Promise<string> {
    if (this.cachedId) return this.cachedId;
    const slug = this.config.get<string>('DEFAULT_TENANT_SLUG') ?? 'exlege';
    const tenant = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!tenant) throw new NotFoundException(`Tenant "${slug}" not found — run pnpm db:seed`);
    this.cachedId = tenant.id;
    return tenant.id;
  }
}
