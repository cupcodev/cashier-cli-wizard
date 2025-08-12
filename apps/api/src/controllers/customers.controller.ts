import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Body,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { UpdateCustomerDto } from '../dtos/customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  /**
   * GET /customers
   * Query string:
   * - q: termo de busca (razão social, fantasia, email, whatsapp, CNPJ/CPF)
   * - limit: máx 500 (default 100)
   * - offset: default 0
   * - orderBy: campo da tabela customers (ex.: razao_social)
   * - orderDir: ASC | DESC (default ASC)
   */
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: string,
  ) {
    const limit = Number.isFinite(Number(limitStr)) ? Number(limitStr) : undefined;
    const offset = Number.isFinite(Number(offsetStr)) ? Number(offsetStr) : undefined;
    const dir = (orderDir || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    return this.service.list({
      q: q?.trim() || undefined,
      limit,
      offset,
      orderBy: (orderBy as any) || 'razao_social',
      orderDir: dir as 'ASC' | 'DESC',
    });
  }

  // GET /customers/:id
  @Get(':id')
  getOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.findOne(id);
  }

  // PATCH /customers/:id
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: any,
  ) {
    const actor = req?.user?.email || 'system';
    return this.service.update(id, dto, actor);
  }
}