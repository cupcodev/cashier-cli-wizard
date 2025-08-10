import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';

@Controller('/ops')
export class OpsController {
  constructor(@InjectRepository(Invoice) private invRepo: Repository<Invoice>) {}
  @Get('metrics') async metrics() {
    const billed = await this.invRepo.createQueryBuilder('i')
      .select('COALESCE(SUM(i.amount_cents),0)','sum')
      .where(`date_trunc('month', i.due_date::timestamp) = date_trunc('month', CURRENT_DATE)`)
      .getRawOne();
    const received = await this.invRepo.createQueryBuilder('i')
      .select('COALESCE(SUM(i.amount_cents),0)','sum')
      .where(`i.status = 'paid' AND date_trunc('month', i.updated_at) = date_trunc('month', CURRENT_DATE)`)
      .getRawOne();
    const overdue = await this.invRepo.createQueryBuilder('i')
      .select('COALESCE(SUM(i.amount_cents),0)','sum')
      .where(`i.status = 'open' AND i.due_date < CURRENT_DATE`)
      .getRawOne();
    return {
      billedMonthCents: Number(billed.sum||0),
      receivedMonthCents: Number(received.sum||0),
      overdueCents: Number(overdue.sum||0),
      delinquencyPct: 0
    };
  }
}
