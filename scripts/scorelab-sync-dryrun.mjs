import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const proc = spawnSync(
  'npx',
  ['--yes', 'tsx', 'scripts/scorelab-sync-dryrun-boot.ts'],
  {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL ?? '' },
  }
);

process.exit(proc.status === null ? 1 : proc.status);