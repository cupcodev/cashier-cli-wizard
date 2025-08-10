import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';

@Controller('invoices')
export class InvoicesController {
  constructor(@InjectRepository(Invoice) private repo: Repository<Invoice>) {}
  @Get() async list() { return this.repo.find({ order: { due_date: 'ASC' } }); }
  @Get(':id') async get(@Param('id') id: string) { return this.repo.findOneOrFail({ where: { id } }); }
}
