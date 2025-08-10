import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';

@Controller('customers')
export class CustomersController {
  constructor(@InjectRepository(Customer) private repo: Repository<Customer>) {}
  @Get() async list() { return this.repo.find({ order: { legal_name: 'ASC' } }); }
}
