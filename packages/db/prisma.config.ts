import { join } from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 no longer auto-loads .env. Load the repo-root one with Node's built-in loader.
try {
  process.loadEnvFile(join(__dirname, '../../.env'));
} catch {
  // .env absent (e.g. CI) — rely on real environment variables
}

export default defineConfig({
  schema: join(__dirname, 'prisma/schema.prisma'),
  migrations: {
    path: join(__dirname, 'prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
