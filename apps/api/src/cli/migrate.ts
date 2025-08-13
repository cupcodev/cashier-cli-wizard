// apps/api/src/cli/migrate.ts
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_PATH || 'apps/api/.env' });
import { AppDataSource } from '../database/data-source';

function normalizeCmd(arg?: string) {
  const c = (arg || 'run').toLowerCase();
  if (['run', 'up', 'migrate'].includes(c)) return 'run';
  if (['revert', 'down', 'rollback'].includes(c)) return 'revert';
  if (['show', 'status', 'pending'].includes(c)) return 'show';
  return 'help';
}

async function main() {
  const [, , raw] = process.argv;
  const cmd = normalizeCmd(raw);

  await AppDataSource.initialize();
  try {
    if (cmd === 'run') {
      const res = await AppDataSource.runMigrations();
      console.log(
        'Migrations executadas:',
        res.length ? res.map(m => m.name) : '(nenhuma pendente)'
      );
    } else if (cmd === 'revert') {
      await AppDataSource.undoLastMigration();
      console.log('Última migration revertida.');
    } else if (cmd === 'show') {
      const has = await AppDataSource.showMigrations();
      console.log('Há migrations pendentes?', has);
    } else {
      console.log('Uso:');
      console.log('  node dist/cli/migrate.js run     # aplica pendentes (default)');
      console.log('  node dist/cli/migrate.js revert  # reverte a última');
      console.log('  node dist/cli/migrate.js show    # mostra se há pendentes');
      process.exitCode = 2;
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((e) => {
  console.error('[migrate] failed:', e);
  process.exit(1);
});