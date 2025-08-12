// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';

import { AppController } from './controllers/app.controller';
import { OpsController } from './controllers/ops.controller';
import { InvoicesController } from './controllers/invoices.controller';

// ENTITIES
import { Customer } from './entities/customer.entity';
import { CustomerContact } from './entities/customer-contact.entity';
import { CustomerAddress } from './entities/customer-address.entity';
import { PackageEntity } from './entities/package.entity';
import { Subscription } from './entities/subscription.entity';
import { Invoice, InvoiceItem } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { AuditLog } from './entities/audit-log.entity';

// MÓDULOS DE FEATURES
import { CustomersModule } from './modules/customers.module';

@Module({
  imports: [
    // Conexão principal
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      // >>> GARANTE que todas as entidades das relações estão carregadas
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
      // Em DEV você pode ligar para criar tabelas automaticamente
      synchronize: process.env.DB_SYNC === '1',
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