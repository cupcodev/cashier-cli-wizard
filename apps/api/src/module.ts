// apps/api/src/module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';

// Auth
import { AuthModule } from './auth/auth.module';

// Controllers
import { AppController } from './controllers/app.controller';
import { OpsController } from './controllers/ops.controller';
import { InvoicesController } from './controllers/invoices.controller';

// ENTITIES (mantidas em apps/api/src/entities)
import { Customer } from './entities/customer.entity';
import { CustomerContact } from './entities/customer-contact.entity';
import { CustomerAddress } from './entities/customer-address.entity';
import { PackageEntity } from './entities/package.entity';
import { Subscription } from './entities/subscription.entity';
import { Invoice, InvoiceItem } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { AuditLog } from './entities/audit-log.entity';

// Módulos de features
import { CustomersModule } from './modules/customers.module';

@Module({
  imports: [
    // Garante carregamento do apps/api/.env rodando de src ou dist
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../.env'),
    }),

    // Conexão principal do TypeORM (sem glob; com suporte a URL e SSL)
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const hasUrl = !!process.env.DATABASE_URL;
        const sslEnabled =
          String(process.env.DB_SSL).toLowerCase() === 'true' ||
          (process.env.DATABASE_URL || '').includes('sslmode=require');

        const common = {
          type: 'postgres' as const,
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
          // Nunca habilite em produção
          synchronize: process.env.DB_SYNC === '1',
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        };

        return hasUrl
          ? { ...common, url: process.env.DATABASE_URL }
          : {
              ...common,
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT || 5432),
              username: process.env.DB_USER,
              password: process.env.DB_PASS,
              database: process.env.DB_NAME,
            };
      },
    }),

    // Repositórios usados diretamente por Ops/Invoices controllers
    TypeOrmModule.forFeature([
      Customer,
      CustomerContact,
      CustomerAddress,
      PackageEntity,
      Subscription,
      Invoice,
      InvoiceItem,
      Payment,
      AuditLog,
    ]),

    AuthModule,
    CustomersModule,
  ],
  controllers: [AppController, OpsController, InvoicesController],
})
export class AppModule {}