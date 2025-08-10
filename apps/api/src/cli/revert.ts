import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_PATH || 'apps/api/.env' });
import { AppDataSource } from '../database/data-source';

(async () => {
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.undoLastMigration();
    console.log('[revert] ok:', res);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (e) {
    console.error('[revert] failed:', e);
    process.exit(1);
  }
})();
