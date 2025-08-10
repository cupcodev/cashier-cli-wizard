import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controllers/app.controller';
import { AuthModule } from './auth/auth.module';
import { Customer } from './entities/customer.entity';
import { PackageEntity } from './entities/package.entity';
import { Subscription } from './entities/subscription.entity';
import { Invoice, InvoiceItem } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { AuditLog } from './entities/audit-log.entity';
import { CustomersController } from './controllers/customers.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { OpsController } from './controllers/ops.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false
    }),
    TypeOrmModule.forFeature([Customer, PackageEntity, Subscription, Invoice, InvoiceItem, Payment, AuditLog]),
    AuthModule
  ],
  controllers: [AppController, OpsController, CustomersController, InvoicesController],
})
export class AppModule {}
