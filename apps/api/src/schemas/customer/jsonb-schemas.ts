import { z } from 'zod';
import { isIP } from 'node:net';

/**
 * Regras comuns/reutilizáveis
 */
const percent = z.number().min(0).max(100);
const money = z.number().min(0);
const day1to28 = z.number().int().min(1).max(28);
const posInt = z.number().int().min(0);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'data no formato YYYY-MM-DD');
const idioma = z.enum(['pt-BR','en-US']).default('pt-BR');
const canais = z.array(z.enum(['email','sms','whatsapp','portal'])).default(['email']);
const url = z.string().url();

/**
 * 3) Preferências de Cobrança & Faturamento
 */
export const CobrancaPrefsSchema = z.object({
  moeda: z.string().default('BRL'),
  dia_fatura: day1to28.default(1),
  prazo_pagamento_dias: posInt.default(7),
  multa_atraso_percent: z.number().min(0).max(20).default(2), // limite razoável
  juros_mora_percent_ao_mes: z.number().min(0).max(20).default(1),
  desconto_pagamento_antecipado_percent: percent.default(0),
  reajuste_anual_indice: z.enum(['IPCA','IGP-M','Fixo','Outro']).default('IPCA'),
  reajuste_data_base: isoDate.optional(),
  canais_envio_fatura: canais,
  idioma_comunicacoes: idioma,
  anexar_pdf_na_fatura: z.boolean().default(true),
  observacao_padrao_fatura: z.string().max(3000).default(''),
  incluir_boletos: z.boolean().default(false),
  enviar_nota_fiscal_automaticamente: z.boolean().default(true),
  envio_webhook_faturas: z.object({
    enabled: z.boolean().default(false),
    url: url.optional()
  }).default({ enabled: false })
}).strict();

/**
 * 4) Meios de Pagamento & Credenciais (apenas flags/tokens)
 */
export const PagamentoPrefsSchema = z.object({
  meio_preferencial: z.enum(['Pix','Cartão','Boleto','Transferência']).default('Pix'),
  pix: z.object({
    aceita_pix: z.boolean().default(true),
    instrucoes: z.string().max(2000).optional()
  }).default({ aceita_pix: true }),
  cartao: z.object({
    pagar_com_cartao: z.boolean().default(false),
    cartao_tokenizado_id: z.string().max(255).optional()
  }).default({ pagar_com_cartao: false }),
  boleto: z.object({
    aceita_boleto: z.boolean().default(false),
    dias_boleto: posInt.default(3),
    instrucoes_boleto: z.string().max(2000).optional()
  }).default({ aceita_boleto: false, dias_boleto: 3 }),
  transferencia: z.object({
    aceita_transferencia: z.boolean().default(false),
    instrucoes_transferencia: z.string().max(2000).optional()
  }).default({ aceita_transferencia: false }),
  gateways: z.object({
    gateway_cartao: z.enum(['Pagar.me','Stripe','PagSeguro','MercadoPago','Outro']).optional(),
    gateway_pix: z.enum(['Pagar.me','Stripe','PagSeguro','MercadoPago','Outro']).optional(),
    gateway_boleto: z.enum(['Pagar.me','Stripe','PagSeguro','MercadoPago','Outro']).optional(),
  }).default({}),
  limite_credito: money.default(0),
  bloqueio_por_inadimplencia: z.boolean().default(true),
  criterio_bloqueio_dias: z.number().int().min(1).max(120).default(15)
}).strict();

/**
 * 6) Regras de Tributação & Retenções
 */
export const FiscalRulesSchema = z.object({
  municipio_prestacao: z.string().min(1),
  item_lista_servicos_lc116: z.string().min(1), // ex.: "1.05"
  codigo_tributacao_municipal: z.string().min(1).optional(),
  aliquota_iss_percent: percent.default(5),
  iss_retido: z.boolean().default(false),

  irrf_retido: z.boolean().default(false),
  aliquota_irrf_percent: percent.default(0),

  inss_retido: z.boolean().default(false),
  aliquota_inss_percent: percent.default(0),

  csll_retida: z.boolean().default(false),
  aliquota_csll_percent: percent.default(0),

  pis_retido: z.boolean().default(false),
  aliquota_pis_percent: percent.default(0),

  cofins_retido: z.boolean().default(false),
  aliquota_cofins_percent: percent.default(0),

  inscricao_municipal_tomador: z.string().optional(),
  exigibilidade_iss: z.enum(['Normal','Exigibilidade Suspensa','Isento']).default('Normal'),
  regime_especial_tributacao: z.string().nullable().optional(),
  observacoes_fiscais: z.string().max(3000).default('')
}).strict();

/**
 * 7) NFS-e
 */
export const NfseSettingsSchema = z.object({
  prefeitura: z.string().min(1), // ex.: "Curitiba/PR"
  ambiente_nfse: z.enum(['Producao','Homologacao','Produção','Homologação']).default('Producao'),
  rps_serie: z.string().min(1).default('A'),
  rps_proximo_numero: z.number().int().min(1).default(1),
  lote_proximo_numero: z.number().int().min(1).default(1),
  enviar_nfse_para_email_do_cliente: z.boolean().default(true),
  modelo_discriminacao_servico: z.string().min(1).max(5000)
    .default('Prestação de serviços conforme contrato. Ref.: {{fatura_numero}}'),
  retencoes_automatica_base: z.enum(['preco_cheio','preco_menos_descontos','custom']).default('preco_cheio'),
  anexar_xml_pdf_nfse_na_fatura: z.boolean().default(true),
  responsavel_envio_nfse: z.enum(['automatico_pos_pagamento','na_emissao','manual']).default('automatico_pos_pagamento')
}).strict();

/**
 * 8) Dunning / Régua de Cobrança
 */
const lembrete = z.object({
  dias: z.number().int().min(-30).max(365),
  canais: z.array(z.enum(['email','sms','whatsapp'])).min(1)
});
export const DunningRulesSchema = z.object({
  politica_cobranca: z.string().default('Padrao B2B'),
  reminders_antes_vencimento: z.array(lembrete).default([]),
  reminders_pos_vencimento: z.array(lembrete).default([]),
  oferta_negociacao_automatica: z.boolean().default(false),
  pausar_servicos_apos_dias_em_atraso: z.number().int().min(1).max(120).default(15),
  cancelar_apos_dias_em_atraso: z.number().int().min(1).max(365).default(60),
  responsavel_interno_escala: z.string().email().optional(),
  mensagens_personalizadas_por_etapa: z.record(z.string(), z.string().max(2000)).default({})
}).strict();

/**
 * 9) Financeiro (KPIs)
 */
export const FinanceKpisSchema = z.object({
  mrr_atual: money.default(0),
  arr_estimado: money.default(0),
  ticket_medio: money.default(0),
  lifetime_value: money.default(0),
  saldo_em_aberto: money.default(0),
  faturas_em_aberto_qtd: posInt.default(0),
  aging: z.object({
    '0-30': money.default(0),
    '31-60': money.default(0),
    '61-90': money.default(0),
    '90+': money.default(0),
  }).default({ '0-30':0, '31-60':0, '61-90':0, '90+':0 }),
  inadimplencia_media_dias: posInt.default(0),
  ultimo_pagamento: z.object({
    data: z.string().datetime().nullable().optional(),
    valor: money.default(0)
  }).default({ data: null, valor: 0 }),
  churn_risk_score: z.number().min(0).max(100).default(0),
  historico_faturamento_mensal: z.array(z.object({
    mes: z.string().regex(/^\d{4}-\d{2}$/,'YYYY-MM'),
    valor: money,
    status: z.enum(['ok','atraso','cancelado']).default('ok')
  })).default([])
}).strict();

/**
 * 10) Contabilidade
 */
export const ContabilidadeSchema = z.object({
  centro_custo_padrao: z.string().optional(),
  plano_de_contas_padrao: z.string().optional(),
  projeto_obra_campanha: z.string().nullable().optional(),
  marcadores_gerenciais: z.array(z.string()).default([])
}).strict();

/**
 * 11) Portal do Cliente
 */
export const PortalConfigSchema = z.object({
  habilitar_portal_cliente: z.boolean().default(true),
  url_portal_personalizada: z.string().url().nullable().optional(),
  branding_portal: z.object({
    logo_url: z.string().url().nullable().optional(),
    cor_primaria: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).default('#9b5cff')
  }).default({ cor_primaria: '#9b5cff' }),
  // Obs.: usuários do portal idealmente em tabela própria (MFA/2FA)
  usuarios: z.array(z.any()).default([])
}).strict();

/**
 * 12) Documentos & Anexos (apenas refs/IDs)
 */
const fileRef = z.object({
  id: z.string(),
  name: z.string()
});
export const DocumentosRefsSchema = z.object({
  contrato_assinado: z.array(fileRef).default([]),
  propostas: z.array(fileRef).default([]),
  notas_fiscais: z.array(fileRef).default([]),
  comprovantes_pagamento: z.array(fileRef).default([]),
  ndas: z.array(fileRef).default([]),
  outros_documentos: z.array(fileRef).default([])
}).strict();

/**
 * 13) LGPD & Compliance
 */
export const LgpdSchema = z.object({
  base_legal_tratamento: z.enum(['Execucao de contrato','Consentimento','Obrigacao legal','Legitimo interesse'])
    .default('Execucao de contrato'),
  finalidades_tratamento: z.array(z.string()).min(1).default(['faturar','contatar','suporte']),
  prazo_retencao_dados_pessoais_anos: z.number().int().min(1).max(20).default(5),
  prazo_retencao_logs_auditoria_anos: z.number().int().min(1).max(20).default(10),
  consentimentos: z.array(z.object({
  tipo: z.string(),
  data: z.string().datetime(),
  ip: z.string().refine(v => !v || isIP(v) !== 0, { message: 'IP inválido' }),
  versao: z.string()
})).default([]),
  restricoes_contato: z.object({
    silencioso: z.boolean().default(false),
    horarios: z.string().default('9h-18h'),
    canais_permitidos: z.array(z.enum(['email','sms','whatsapp','portal'])).default(['email','whatsapp'])
  }).default({ silencioso:false, horarios:'9h-18h', canais_permitidos:['email','whatsapp'] }),
  solicitacoes_titular: z.array(z.object({
    tipo: z.enum(['acesso','retificacao','exclusao','portabilidade']),
    data: z.string().datetime(),
    status: z.enum(['aberto','em_andamento','atendido','negado']).default('aberto')
  })).default([]),
  data_ultima_revisao_cadastro: isoDate.optional()
}).strict();

/**
 * 16) Integrações (por cliente)
 */
export const IntegracoesSchema = z.object({
  erp_integrado: z.string().nullable().optional(),
  chaves_integracao: z.record(z.string(), z.string()).default({}), // segredos no cofre, não aqui
  crm_externo_id: z.string().nullable().optional(),
  webhooks_cliente: z.array(z.object({
    evento: z.enum(['invoice.created','payment.succeeded','dunning.step']),
    url: url
  })).default([])
}).strict();

/** Tipos TS inferidos (úteis no service) */
export type CobrancaPrefs = z.infer<typeof CobrancaPrefsSchema>;
export type PagamentoPrefs = z.infer<typeof PagamentoPrefsSchema>;
export type FiscalRules = z.infer<typeof FiscalRulesSchema>;
export type NfseSettings = z.infer<typeof NfseSettingsSchema>;
export type DunningRules = z.infer<typeof DunningRulesSchema>;
export type FinanceKpis = z.infer<typeof FinanceKpisSchema>;
export type Contabilidade = z.infer<typeof ContabilidadeSchema>;
export type PortalConfig = z.infer<typeof PortalConfigSchema>;
export type DocumentosRefs = z.infer<typeof DocumentosRefsSchema>;
export type Lgpd = z.infer<typeof LgpdSchema>;
export type Integracoes = z.infer<typeof IntegracoesSchema>;