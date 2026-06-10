import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  const email = process.env.SEED_OWNER_EMAIL ?? 'admin@exlege.local';
  const password = process.env.SEED_OWNER_PASSWORD ?? 'ChangeMe123!';

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'exlege' },
    update: {},
    create: { slug: 'exlege', name: 'Ex Lège' },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Owner', passwordHash: await argon2.hash(password) },
  });

  await prisma.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { role: 'OWNER' },
    create: { tenantId: tenant.id, userId: user.id, role: 'OWNER' },
  });

  console.log(`Seeded tenant "${tenant.slug}" with owner ${email}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
