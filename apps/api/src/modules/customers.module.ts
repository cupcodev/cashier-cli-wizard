import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from '../controllers/customers.controller';
import { CustomersService } from '../services/customers.service';
import { Customer } from '../entities/customer.entity';
import { CustomerContact } from '../entities/customer-contact.entity';
import { CustomerAddress } from '../entities/customer-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerContact, CustomerAddress])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}