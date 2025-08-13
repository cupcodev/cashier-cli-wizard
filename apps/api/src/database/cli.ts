// apps/api/src/database/cli.ts
import { config as dotenv } from 'dotenv';
import { resolve, join } from 'path';
dotenv({ path: resolve(__dirname, '../../.env') });

import { DataSource } from 'typeorm';

// === ENTIDADES: liste TODAS as usadas nos relacionamentos ===
import { Customer } from '../entities/customer.entity';
import { CustomerContact } from '../entities/customer-contact.entity';
import { CustomerAddress } from '../entities/customer-address.entity';
import { Invoice, InvoiceItem } from '../entities/invoice.entity';
import { PackageEntity } from '../entities/package.entity';
import { Subscription } from '../entities/subscription.entity';
import { Payment } from '../entities/payment.entity';
import { AuditLog } from '../entities/audit-log.entity';

// __dirname aqui, em runtime, é: apps/api/dist/database
const migrationsAll = [
  join(__dirname, './migrations/*.{js,cjs}'),   // dist/database/migrations
  join(__dirname, '../migrations/*.{js,cjs}'),  // dist/migrations
];

// Para forçar apenas a migration "init" primeiro
const migrationsInitOnly = [
  join(__dirname, './migrations/1700000000000-init.js'),
];

// Habilita modo "só init" via flag ou env
const useInitOnly =
  process.env.MIGRATIONS_ONLY_INIT === '1' ||
  process.argv.includes('--only-init');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // Lista explícita de entidades evita "metadata not found"
  entities: [
    Customer,
    CustomerContact,
    CustomerAddress,
    Invoice,
    InvoiceItem,
    PackageEntity,
    Subscription,
    Payment,
    AuditLog,
  ],

  // Escolhe o conjunto de migrations conforme o modo
  migrations: useInitOnly ? migrationsInitOnly : migrationsAll,

  logging: true,
});

export default AppDataSource;

// Runner opcional: permite "node dist/database/cli.js migrate:run [--only-init]"
if (require.main === module) {
  (async () => {
    const [, , cmd, ...rest] = process.argv;
    const onlyInit = rest.includes('--only-init');
    if (onlyInit && !process.argv.includes('--only-init')) {
      // nada — já tratado acima
    }
    await AppDataSource.initialize();

    try {
      if (cmd === 'migrate:run') {
        const res = await AppDataSource.runMigrations();
        console.log('Migrations executadas:', res.map(m => m.name));
      } else if (cmd === 'migrate:revert') {
        await AppDataSource.undoLastMigration();
        console.log('Última migration revertida.');
      } else if (cmd === 'migrate:show') {
        const has = await AppDataSource.showMigrations();
        console.log('Há migrations pendentes?', has);
      } else {
        console.log('Use: migrate:run | migrate:revert | migrate:show  (flags: --only-init)');
      }
    } finally {
      await AppDataSource.destroy();
    }
  })().catch(async (e) => {
    console.error(e);
    try { await AppDataSource.destroy(); } catch {}
    process.exit(1);
  });
}