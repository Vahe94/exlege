import { join } from 'node:path';
import { defineConfig } from 'prisma/config';

// Load the repo-root .env (Prisma CLI only looks in the package dir by default).
// Node 22's built-in loader — no dotenv dependency needed.
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
});
