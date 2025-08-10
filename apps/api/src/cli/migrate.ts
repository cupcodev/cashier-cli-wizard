import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_PATH || 'apps/api/.env' });
import { AppDataSource } from '../database/data-source';

(async () => {
  try {
    await AppDataSource.initialize();
    const ran = await AppDataSource.runMigrations();
    console.log('[migrate] applied:', ran.map(m => m.name));
    await AppDataSource.destroy();
    process.exit(0);
  } catch (e) {
    console.error('[migrate] failed:', e);
    process.exit(1);
  }
})();
