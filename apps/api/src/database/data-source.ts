import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { PackageEntity } from '../entities/package.entity';
import { Subscription } from '../entities/subscription.entity';
import { Invoice, InvoiceItem } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
import { AuditLog } from '../entities/audit-log.entity';

dotenv.config({ path: process.env.DOTENV_PATH || 'apps/api/.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  synchronize: false,
  logging: false,
  entities: [Customer, PackageEntity, Subscription, Invoice, InvoiceItem, Payment, AuditLog],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});
