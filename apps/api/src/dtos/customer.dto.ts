import {
  IsEnum, IsOptional, IsString, IsArray, IsIn, IsBoolean, IsNumber, IsObject, IsDateString, IsInt, Max, Min, Matches, ValidateNested, IsEmail
} from 'class-validator';
import { Type } from 'class-transformer';
import { PersonType, ClientStatus } from '../entities/customer.entity';

// Contato
export class ContactDto {
  @IsString() nome: string;
  @IsOptional() @IsString() cargo?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @Matches(/^\+?\d{10,15}$/) telefone?: string; // inclui DDI
  @IsOptional() @Matches(/^\+?\d{10,15}$/) whatsapp?: string;
  @IsOptional() @IsIn(['email','sms','whatsapp']) canal_preferido?: string;
  @IsOptional() @IsBoolean() responsavel_financeiro?: boolean;
  @IsOptional() @IsBoolean() responsavel_tecnico?: boolean;
  @IsOptional() @IsString() aceite_comercial_ip?: string;
  @IsOptional() @IsDateString() aceite_comercial_data?: string;
  @IsOptional() @IsString() id?: string; // para update
}

// Endereço
export class AddressDto {
  @IsIn(['cobranca','operacional']) tipo: 'cobranca' | 'operacional';
  @IsString() logradouro: string;
  @IsString() numero: string;
  @IsOptional() @IsString() complemento?: string;
  @IsString() bairro: string;
  @IsString() cidade: string;
  @Matches(/^[A-Z]{2}$/) uf: string;
  @Matches(/^\d{5}-?\d{3}$/) cep: string;
  @IsOptional() @IsInt() codigo_ibge_municipio?: number;
  @IsOptional() @IsString() id?: string;
}

export class UpdateCustomerDto {
  // 1) Identificação
  @IsEnum(PersonType) tipo_pessoa: PersonType;

  @IsOptional() @IsString() razao_social?: string;
  @IsOptional() @IsString() nome_fantasia?: string;

  @IsOptional() @Matches(/^\d{14}$/) cnpj?: string; // só dígitos
  @IsOptional() @Matches(/^\d{11}$/) cpf?: string;

  @IsOptional() @IsString() inscricao_estadual?: string;
  @IsOptional() @IsString() inscricao_municipal?: string;
  @IsOptional() @IsString() cnae_principal_cliente?: string;
  @IsOptional() @IsString() porte_empresa?: string;
  @IsOptional() @IsString() setor_atividade?: string;

  @IsOptional() @IsEnum(ClientStatus) status_cliente?: ClientStatus;
  @IsOptional() @IsString() classificacao_risco?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];

  // 2) Contatos & Endereços
  @IsOptional() @ValidateNested({ each: true }) @Type(() => ContactDto) contatos?: ContactDto[];
  @IsOptional() @ValidateNested({ each: true }) @Type(() => AddressDto) enderecos?: AddressDto[];

  // 3) Cobrança & 4) Pagamento
  @IsOptional() @IsObject() cobranca_prefs?: any; // será validado no service por schema
  @IsOptional() @IsObject() pagamento_prefs?: any;

  // 5) Contratos
  @IsOptional() @IsObject() contratos_info?: any;

  // 6) Fiscal
  @IsOptional() @IsObject() fiscal_rules?: any;

  // 7) NFS-e
  @IsOptional() @IsObject() nfse_settings?: any;

  // 8) Dunning
  @IsOptional() @IsObject() dunning_rules?: any;

  // 9) KPIs
  @IsOptional() @IsObject() finance_kpis?: any;

  // 10) Contabilidade
  @IsOptional() @IsObject() contabilidade?: any;

  // 11) Portal
  @IsOptional() @IsObject() portal_config?: any;

  // 12) Documentos
  @IsOptional() @IsObject() documentos_refs?: any;

  // 13) LGPD
  @IsOptional() @IsObject() lgpd?: any;

  // 16) Integrações
  @IsOptional() @IsObject() integracoes?: any;
}
