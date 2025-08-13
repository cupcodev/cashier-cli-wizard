// apps/api/src/database/data-source.ts
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carrega apps/api/.env tanto em src quanto em dist
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ENTITIES (de src/database → sobe um nível)
import { Customer } from '../entities/customer.entity';
import { CustomerContact } from '../entities/customer-contact.entity';
import { CustomerAddress } from '../entities/customer-address.entity';
import { PackageEntity } from '../entities/package.entity';
import { Subscription } from '../entities/subscription.entity';
import { Invoice, InvoiceItem } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { AuditLog } from '../entities/audit-log.entity';

// Helpers
const truthy = (v?: string) => /^(1|true|yes|on)$/i.test(String(v || ''));

const url = process.env.DATABASE_URL || '';
const hasUrl = !!url;

// SSL habilita se:
// - DB_SSL=1/true
// - ou DATABASE_URL contiver ssl=true/1
// - ou sslmode=require/verify-ca/verify-full
const sslInUrl = /(sslmode=(require|verify-ca|verify-full)|ssl=(true|1))/i.test(url);
const sslEnabled = truthy(process.env.DB_SSL) || sslInUrl;

// Por padrão, quando habilito SSL aqui, deixo rejectUnauthorized = false
// para evitar o erro "self-signed certificate in certificate chain".
// Se quiser forçar verificação do CA um dia, defina DB_SSL_REJECT_UNAUTHORIZED=1
const rejectUnauthorized = truthy(process.env.DB_SSL_REJECT_UNAUTHORIZED);

// Config comum (sem credenciais)
const common = {
  entities: [
    Customer,
    CustomerContact,
    CustomerAddress,
    PackageEntity,
    Subscription,
    Invoice,
    InvoiceItem,
    Payment,
    AuditLog,
  ],
  // Em runtime: __dirname = apps/api/dist/database → ../migrations = apps/api/dist/migrations
  migrations: [path.join(__dirname, '../migrations/*.{js,cjs}')],
  logging: true,
  ...(sslEnabled
    ? {
        ssl: { rejectUnauthorized } as any,
        // Alguns ambientes exigem também em "extra.ssl"
        extra: { ssl: { rejectUnauthorized } } as any,
      }
    : {}),
} satisfies Partial<DataSourceOptions>;

// Monta as opções finais com "type" obrigatório
const options: DataSourceOptions = hasUrl
  ? {
      type: 'postgres',
      url,
      ...common,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ...common,
    };

export const AppDataSource = new DataSource(options);

// Opcional: rodar direto este arquivo compilado
if (require.main === module) {
  (async () => {
    const [, , cmd] = process.argv;
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
        console.log('Use: migrate:run | migrate:revert | migrate:show');
      }
    } finally {
      await AppDataSource.destroy();
    }
  })().catch(async (e) => {
    console.error('[data-source] erro:', e);
    try { await AppDataSource.destroy(); } catch {}
    process.exit(1);
  });
}