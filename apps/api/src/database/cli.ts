import { AppDataSource } from './data-source';

async function run() {
  const [, , cmd] = process.argv;
  await AppDataSource.initialize();
  if (cmd === 'migrate:run') {
    await AppDataSource.runMigrations();
  } else if (cmd === 'migrate:revert') {
    await AppDataSource.undoLastMigration();
  } else {
    console.log('Usage: node dist/db/cli.js migrate:run | migrate:revert');
  }
  await AppDataSource.destroy();
}
run().catch(e => { console.error(e); process.exit(1); });
