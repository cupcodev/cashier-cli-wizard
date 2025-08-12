import {
  CobrancaPrefsSchema, PagamentoPrefsSchema, FiscalRulesSchema, NfseSettingsSchema,
  DunningRulesSchema, FinanceKpisSchema, ContabilidadeSchema, PortalConfigSchema,
  DocumentosRefsSchema, LgpdSchema, IntegracoesSchema
} from '../schemas/customer/jsonb-schemas';
import { parseOrBadRequest, deepMerge } from '../schemas/zod-helpers';

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, DeepPartial } from 'typeorm';

import { Customer, PersonType } from '../entities/customer.entity';
import { CustomerContact } from '../entities/customer-contact.entity';
import { CustomerAddress } from '../entities/customer-address.entity';
import { UpdateCustomerDto } from '../dtos/customer.dto';

export type ListCustomersOptions = {
  q?: string;
  limit?: number;
  offset?: number;
  orderBy?: keyof Customer; // ex.: 'razao_social'
  orderDir?: 'ASC' | 'DESC';
};

/** Utils de documento: validação real de CPF/CNPJ com dígitos verificadores */
function onlyDigits(s: string) { return (s || '').replace(/\D/g, ''); }

function isValidCPF(cpf: string) {
  const v = onlyDigits(cpf);
  if (!v || v.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(v)) return false;
  let sum = 0; for (let i = 0; i < 9; i++) sum += parseInt(v[i]) * (10 - i);
  let d1 = 11 - (sum % 11); if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(v[9])) return false;
  sum = 0; for (let i = 0; i < 10; i++) sum += parseInt(v[i]) * (11 - i);
  let d2 = 11 - (sum % 11); if (d2 >= 10) d2 = 0;
  return d2 === parseInt(v[10]);
}

function isValidCNPJ(cnpj: string) {
  const v = onlyDigits(cnpj);
  if (!v || v.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(v)) return false;
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  let sum = 0; for (let i = 0; i < 12; i++) sum += parseInt(v[i]) * w1[i];
  let d1 = sum % 11; d1 = d1 < 2 ? 0 : 11 - d1;
  if (d1 !== parseInt(v[12])) return false;
  sum = 0; for (let i = 0; i < 13; i++) sum += parseInt(v[i]) * w2[i];
  let d2 = sum % 11; d2 = d2 < 2 ? 0 : 11 - d2;
  return d2 === parseInt(v[13]);
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private readonly repo: Repository<Customer>,
    @InjectRepository(CustomerContact) private readonly contactRepo: Repository<CustomerContact>,
    @InjectRepository(CustomerAddress) private readonly addressRepo: Repository<CustomerAddress>,
  ) {}

  // --- Listagem com busca e paginação (JOIN em contatos para email/whatsapp) ---
  async list(opts: ListCustomersOptions) {
    const {
      q,
      limit = 100,
      offset = 0,
      orderBy = 'razao_social',
      orderDir = 'ASC',
    } = opts;

    const safeLimit = Math.min(Math.max(limit, 1), 500);
    const safeOffset = Math.max(offset, 0);

    const safeOrderBy: (keyof Customer)[] = [
      'razao_social', 'nome_fantasia', 'cnpj', 'cpf',
      'status_cliente', 'criado_em', 'atualizado_em'
    ];
    const orderField = safeOrderBy.includes(orderBy) ? orderBy : 'razao_social';
    const orderDirection = orderDir === 'DESC' ? 'DESC' as const : 'ASC' as const;

    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoin('c.contatos', 'ct')
      .select(['c'])
      .distinct(true)
      .orderBy(`c.${orderField}`, orderDirection)
      .skip(safeOffset)
      .take(safeLimit);

    if (q && q.trim().length > 0) {
      const qTrim = q.trim();
      const qDigits = qTrim.replace(/\D/g, '');

      qb.andWhere(new Brackets((b) => {
        b.where('c.razao_social ILIKE :q', { q: `%${qTrim}%` })
         .orWhere('c.nome_fantasia ILIKE :q', { q: `%${qTrim}%` })
         .orWhere('ct.email ILIKE :q', { q: `%${qTrim}%` });

        if (qDigits.length > 0) {
          b.orWhere('c.cnpj ILIKE :qd', { qd: `%${qDigits}%` })
           .orWhere('c.cpf ILIKE :qd', { qd: `%${qDigits}%` })
           .orWhere('ct.whatsapp ILIKE :qd', { qd: `%${qDigits}%` });
        } else {
          b.orWhere('ct.whatsapp ILIKE :q', { q: `%${qTrim}%` });
        }
      }));
    }

    const [items, total] = await qb.getManyAndCount();
    return { total, items, limit: safeLimit, offset: safeOffset };
  }

  // --- Buscar um cliente (com contatos e endereços) ---
  async findOne(id: string) {
    const customer = await this.repo.findOne({
      where: { id },
      relations: ['contatos', 'enderecos'],
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  // --- Atualização com validação Zod dos blocos JSONB ---
  async update(id: string, dto: UpdateCustomerDto, actor?: string) {
    const c = await this.findOne(id);

    // (1) Validação + merge (apenas dos blocos que vierem no DTO)
    if (dto.cobranca_prefs) {
      const parsed = parseOrBadRequest('cobranca_prefs', CobrancaPrefsSchema, dto.cobranca_prefs);
      c.cobranca_prefs = deepMerge(c.cobranca_prefs || {}, parsed);
    }

    if (dto.pagamento_prefs) {
      if ((dto.pagamento_prefs as any).cartao_pan || (dto.pagamento_prefs as any).cartao_cvv) {
        throw new BadRequestException('Dados sensíveis de cartão não são permitidos');
      }
      const parsed = parseOrBadRequest('pagamento_prefs', PagamentoPrefsSchema, dto.pagamento_prefs);
      c.pagamento_prefs = deepMerge(c.pagamento_prefs || {}, parsed);
    }

    if (dto.fiscal_rules) {
      const parsed = parseOrBadRequest('fiscal_rules', FiscalRulesSchema, dto.fiscal_rules);
      c.fiscal_rules = deepMerge(c.fiscal_rules || {}, parsed);
    }

    if (dto.nfse_settings) {
      const parsed = parseOrBadRequest('nfse_settings', NfseSettingsSchema, dto.nfse_settings);
      c.nfse_settings = deepMerge(c.nfse_settings || {}, parsed);
    }

    if (dto.dunning_rules) {
      const parsed = parseOrBadRequest('dunning_rules', DunningRulesSchema, dto.dunning_rules);
      c.dunning_rules = deepMerge(c.dunning_rules || {}, parsed);
    }

    if (dto.finance_kpis) {
      const parsed = parseOrBadRequest('finance_kpis', FinanceKpisSchema, dto.finance_kpis);
      c.finance_kpis = deepMerge(c.finance_kpis || {}, parsed);
    }

    if (dto.contabilidade) {
      const parsed = parseOrBadRequest('contabilidade', ContabilidadeSchema, dto.contabilidade);
      c.contabilidade = deepMerge(c.contabilidade || {}, parsed);
    }

    if (dto.portal_config) {
      const parsed = parseOrBadRequest('portal_config', PortalConfigSchema, dto.portal_config);
      c.portal_config = deepMerge(c.portal_config || {}, parsed);
    }

    if (dto.documentos_refs) {
      const parsed = parseOrBadRequest('documentos_refs', DocumentosRefsSchema, dto.documentos_refs);
      c.documentos_refs = deepMerge(c.documentos_refs || {}, parsed);
    }

    if (dto.lgpd) {
      const parsed = parseOrBadRequest('lgpd', LgpdSchema, dto.lgpd);
      c.lgpd = deepMerge(c.lgpd || {}, parsed);
    }

    if (dto.integracoes) {
      const parsed = parseOrBadRequest('integracoes', IntegracoesSchema, dto.integracoes);
      c.integracoes = deepMerge(c.integracoes || {}, parsed);
    }

    // (2) Regras dependentes (PJ/PF)
    if (dto.tipo_pessoa === PersonType.PJ) {
      if (!dto.cnpj && !c.cnpj) throw new BadRequestException('CNPJ é obrigatório para PJ');
      if (dto.cnpj && !isValidCNPJ(dto.cnpj)) throw new BadRequestException('CNPJ inválido');
      if (!dto.razao_social && !c.razao_social) throw new BadRequestException('Razão Social é obrigatória para PJ');
    }
    if (dto.tipo_pessoa === PersonType.PF) {
      if (dto.cpf && !isValidCPF(dto.cpf)) throw new BadRequestException('CPF inválido');
    }

    // (3) Campos simples (NÃO mexer nos JSONB aqui — já foram mesclados acima)
    Object.assign(c, {
      tipo_pessoa: dto.tipo_pessoa ?? c.tipo_pessoa,
      razao_social: dto.razao_social ?? c.razao_social,
      nome_fantasia: dto.nome_fantasia ?? c.nome_fantasia,
      cnpj: dto.cnpj !== undefined ? onlyDigits(dto.cnpj) : c.cnpj,
      cpf: dto.cpf !== undefined ? onlyDigits(dto.cpf) : c.cpf,
      inscricao_estadual: dto.inscricao_estadual ?? c.inscricao_estadual,
      inscricao_municipal: dto.inscricao_municipal ?? c.inscricao_municipal,
      cnae_principal_cliente: dto.cnae_principal_cliente ?? c.cnae_principal_cliente,
      porte_empresa: dto.porte_empresa ?? c.porte_empresa,
      setor_atividade: dto.setor_atividade ?? c.setor_atividade,
      status_cliente: dto.status_cliente ?? c.status_cliente,
      classificacao_risco: dto.classificacao_risco ?? c.classificacao_risco,
      tags: dto.tags ?? c.tags,
      atualizado_por: actor || 'system',
    });

    // (4) Upsert de contatos — usa create([payload]) para evitar overload ambíguo
    if (dto.contatos) {
      const incomingIds = dto.contatos.filter(x => (x as any).id).map(x => (x as any).id!) as string[];
      if (incomingIds.length) {
        const toDelete = (c.contatos || []).filter(ct => !incomingIds.includes(ct.id));
        if (toDelete.length) await this.contactRepo.remove(toDelete);
      } else {
        if ((c.contatos || []).length) await this.contactRepo.remove(c.contatos);
      }

      const nextContacts: CustomerContact[] = [];
      for (const x of dto.contatos) {
        const id = (x as any).id as string | undefined;
        if (id) {
          const existing = (c.contatos || []).find(ct => ct.id === id);
          if (!existing) throw new BadRequestException(`Contato ${id} não pertence ao cliente`);
          Object.assign(existing, x);
          nextContacts.push(existing);
        } else {
          const payload: DeepPartial<CustomerContact> = { ...(x as any), customer: c };
          const [created] = this.contactRepo.create([payload] as DeepPartial<CustomerContact>[]);
          nextContacts.push(created as CustomerContact);
        }
      }
      c.contatos = await this.contactRepo.save(nextContacts);
    }

    // (5) Upsert de endereços — mesma técnica
    if (dto.enderecos) {
      const incomingIds = dto.enderecos.filter(x => (x as any).id).map(x => (x as any).id!) as string[];
      if (incomingIds.length) {
        const toDelete = (c.enderecos || []).filter(ad => !incomingIds.includes(ad.id));
        if (toDelete.length) await this.addressRepo.remove(toDelete);
      } else {
        if ((c.enderecos || []).length) await this.addressRepo.remove(c.enderecos);
      }

      const nextAddrs: CustomerAddress[] = [];
      for (const x of dto.enderecos) {
        const id = (x as any).id as string | undefined;
        if (id) {
          const existing = (c.enderecos || []).find(ad => ad.id === id);
          if (!existing) throw new BadRequestException(`Endereço ${id} não pertence ao cliente`);
          Object.assign(existing, x);
          nextAddrs.push(existing);
        } else {
          const payload: DeepPartial<CustomerAddress> = { ...(x as any), customer: c };
          const [created] = this.addressRepo.create([payload] as DeepPartial<CustomerAddress>[]);
          nextAddrs.push(created as CustomerAddress);
        }
      }
      c.enderecos = await this.addressRepo.save(nextAddrs);
    }

    // (6) Regra cruzada: NFS-e exige contato financeiro com e-mail
    const nfse = dto.nfse_settings ?? c.nfse_settings ?? {};
    if (nfse.enviar_nfse_para_email_do_cliente === true) {
      const hasFinanceEmail = (dto.contatos ?? c.contatos ?? [])
        .some((x: any) => x.responsavel_financeiro && !!x.email);
      if (!hasFinanceEmail) {
        throw new BadRequestException('É necessário um contato financeiro com e-mail para envio automático de NFS-e');
      }
    }

    // (7) Salvar
    return await this.repo.save(c);
  }
}