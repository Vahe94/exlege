import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { LoginInput } from '@exlege/types';
import type { Membership, User } from '@exlege/db';
import { PrismaService } from '../prisma/prisma.service';
import type { AccessTokenPayload } from './auth.types';

const REFRESH_TTL_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { memberships: true },
    });
    // argon2.verify against a dummy hash on unknown user would prevent timing
    // user-enumeration; acceptable trade-off for V1 internal tool.
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const membership = user.memberships[0]; // V1: single tenant per user
    if (!membership) throw new UnauthorizedException('No tenant membership');
    return this.issueTokens(user, membership);
  }

  /** Rotation: refresh tokens are single-use; using one deletes it and issues a new pair. */
  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(refreshToken) },
      include: { user: { include: { memberships: true } } },
    });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    const membership = stored.user.memberships[0];
    if (!membership) throw new UnauthorizedException('No tenant membership');
    return this.issueTokens(stored.user, membership);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash: this.hash(refreshToken) },
    });
    return { ok: true };
  }

  private async issueTokens(user: User, membership: Membership) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      tenantId: membership.tenantId,
      role: membership.role,
    };
    const accessToken = await this.jwt.signAsync(payload);

    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hash(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: membership.tenantId,
        role: membership.role,
      },
    };
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
