import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerContact } from './customer-contact.entity';
import { CustomerAddress } from './customer-address.entity';

export enum PersonType {
  PJ = 'PJ',
  PF = 'PF',
}

export enum ClientStatus {
  ATIVO = 'Ativo',
  TRIAL = 'Trial',
  PAUSADO = 'Pausado',
  INADIMPLENTE = 'Inadimplente',
  ENCERRADO = 'Encerrado',
}

@Entity({ name: 'customers' })
@Index('idx_customer_cnpj', ['cnpj'], { unique: true, where: '"cnpj" IS NOT NULL' })
@Index('idx_customer_cpf', ['cpf'], { unique: true, where: '"cpf" IS NOT NULL' })
@Index('idx_customer_status', ['status_cliente'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ----------------------------
  // 1) Identificação & Classificação
  // ----------------------------

  @Column({ type: 'enum', enum: PersonType })
  tipo_pessoa: PersonType;

  // Mapeia para a coluna legacy 'legal_name' (já existente).
  @Column({ name: 'legal_name', type: 'varchar', length: 255, nullable: true })
  razao_social: string | null;

  // Mapeia para a coluna legacy 'trade_name' (já existente).
  @Column({ name: 'trade_name', type: 'varchar', length: 255, nullable: true })
  nome_fantasia: string | null;

  // Novas colunas específicas — mantemos 'tax_id' como legacy abaixo.
  @Column({ type: 'varchar', length: 14, nullable: true })
  cnpj: string | null; // apenas dígitos

  @Column({ type: 'varchar', length: 11, nullable: true })
  cpf: string | null; // apenas dígitos

  // Coluna legacy única para doc fiscal (mantida para compatibilidade).
  @Column({ name: 'tax_id', type: 'varchar', length: 18, nullable: true })
  tax_id_legacy: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  inscricao_estadual: string | null; // "ISENTO" permitido

  @Column({ type: 'varchar', length: 60, nullable: true })
  inscricao_municipal: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cnae_principal_cliente: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  porte_empresa: string | null; // MEI/ME/EPP/Médio/Grande

  @Column({ type: 'varchar', length: 60, nullable: true })
  setor_atividade: string | null;

  // Grava em 'status' (coluna legacy) para não quebrar dados existentes.
  // Mantido como VARCHAR por compatibilidade; após migração dos valores,
  // podemos trocar para type: 'enum' com enumName estável no Postgres.
  @Column({ name: 'status', type: 'varchar', length: 20, default: ClientStatus.ATIVO })
  status_cliente: ClientStatus;

  @Column({ type: 'varchar', length: 30, nullable: true })
  classificacao_risco: string | null; // score/rating interno

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  // ----------------------------
  // 2) Contatos & Responsáveis
  // ----------------------------

  @OneToMany(() => CustomerContact, (c) => c.customer, { cascade: true })
  contatos: CustomerContact[];

  // Campos de contato "simples" (legados) mantidos:
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  whatsapp: string | null;

  // ----------------------------
  // 3) Endereços
  // ----------------------------

  @OneToMany(() => CustomerAddress, (a) => a.customer, { cascade: true })
  enderecos: CustomerAddress[];

  // Endereço legacy em JSONB (mantido p/ compatibilidade com a antiga 'address')
  @Column({ name: 'address', type: 'jsonb', nullable: true })
  address_legacy: any;

  // ----------------------------
  // 4) Preferências, contratos e regras (JSONB)
  // ----------------------------

  // Preferências de Cobrança & Faturamento
  @Column({ type: 'jsonb', default: {} })
  cobranca_prefs: any;

  // Meios de Pagamento & Credenciais (tokens/flags; nunca PAN/CVV)
  @Column({ type: 'jsonb', default: {} })
  pagamento_prefs: any;

  // Planos/Contratos/Itens (metadados no cliente; itens em faturas/assinaturas)
  @Column({ type: 'jsonb', default: {} })
  contratos_info: any;

  // Regras de Tributação & Retenções
  @Column({ type: 'jsonb', default: {} })
  fiscal_rules: any;

  // Emissão de NFS-e
  @Column({ type: 'jsonb', default: {} })
  nfse_settings: any;

  // Dunning / régua de cobrança
  @Column({ type: 'jsonb', default: {} })
  dunning_rules: any;

  // Financeiro (KPIs do cliente)
  @Column({ type: 'jsonb', default: {} })
  finance_kpis: any;

  // Centro de custo & contabilidade
  @Column({ type: 'jsonb', default: {} })
  contabilidade: any;

  // Portal do Cliente
  @Column({ type: 'jsonb', default: {} })
  portal_config: any;

  // Documentos (refs/URLs/IDs do storage)
  @Column({ type: 'jsonb', default: {} })
  documentos_refs: any;

  // LGPD & Compliance
  @Column({ type: 'jsonb', default: {} })
  lgpd: any;

  // Integrações e webhooks (por cliente)
  @Column({ type: 'jsonb', default: {} })
  integracoes: any;

  // ----------------------------
  // 5) Prazos LGPD (legacy) & Auditoria
  // ----------------------------

  // Campo legacy já existente
  @Column({ name: 'pii_expire_at', type: 'timestamptz', nullable: true })
  pii_expire_at?: Date;

  // Mantém as colunas legacy 'created_at' e 'updated_at' com novos nomes de propriedade
  @CreateDateColumn({ name: 'created_at' })
  criado_em: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  atualizado_em: Date;

  @Column({ type: 'varchar', length: 120, nullable: true })
  criado_por: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  atualizado_por: string | null;
}