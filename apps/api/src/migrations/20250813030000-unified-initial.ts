import { MigrationInterface, QueryRunner } from "typeorm";

export class UnifiedInitial20250813030000 implements MigrationInterface {
  name = 'UnifiedInitial20250813030000';

  public async up(q: QueryRunner): Promise<void> {
    // Extensões
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Enums
    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'person_type_enum') THEN
          CREATE TYPE person_type_enum AS ENUM ('PJ', 'PF');
        END IF;
      END$$;
    `);

    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type_enum') THEN
          CREATE TYPE address_type_enum AS ENUM ('cobranca','operacional');
        END IF;
      END$$;
    `);

    // =========================
    // customers
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

        -- Classificação/identificação
        tipo_pessoa person_type_enum,
        legal_name varchar(255),       -- mapeado por razao_social (entity)
        trade_name varchar(255),       -- mapeado por nome_fantasia (entity)
        cnpj varchar(14),
        cpf  varchar(11),
        tax_id varchar(18),

        inscricao_estadual varchar(30),
        inscricao_municipal varchar(60),
        cnae_principal_cliente varchar(20),
        porte_empresa varchar(20),
        setor_atividade varchar(60),

        -- Contatos herdados (legado): mantidos para compat.
        email text,
        phone text,
        whatsapp text,

        -- Endereço legado (estrutura livre)
        address jsonb,

        -- Taxonomia/estado
        tags text[] DEFAULT '{}'::text[],
        status_cliente text DEFAULT 'Ativo',

        -- LGPD
        pii_expire_at timestamptz,

        -- Auditoria
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        criado_por varchar(120),
        atualizado_por varchar(120)
      )
    `);

    // Índices/uniqueness parciais
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_cnpj ON customers (cnpj) WHERE cnpj IS NOT NULL`);
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_cpf  ON customers (cpf)  WHERE cpf  IS NOT NULL`);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_customer_status ON customers (status_cliente)`);

    // =========================
    // packages
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        category text NOT NULL,
        tier text NOT NULL,
        base_price_cents integer NOT NULL DEFAULT 0,
        promo_price_cents integer NOT NULL DEFAULT 0,
        periodicity text NOT NULL DEFAULT 'monthly',
        config jsonb,
        active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // =========================
    // subscriptions
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        package_id  uuid NOT NULL REFERENCES packages(id),
        charge_day integer NOT NULL DEFAULT 5,
        next_due_date date,

        -- juros/multa/desc conforme entity
        use_percentage_interest boolean NOT NULL DEFAULT true,
        interest_value_or_pct_bp integer NOT NULL DEFAULT 200,
        use_percentage_late_fee boolean NOT NULL DEFAULT true,
        late_fee_value_or_pct_bp integer NOT NULL DEFAULT 200,
        early_discount_enabled boolean NOT NULL DEFAULT false,
        early_discount_until date,
        early_discount_value_cents integer,

        status text NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // =========================
    // invoices
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        due_date date NOT NULL,
        amount_cents integer NOT NULL,
        status text NOT NULL DEFAULT 'open',
        terms jsonb,
        settlement_reason text,
        settlement_attachment_file_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await q.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description text NOT NULL,
        amount_cents integer NOT NULL
      )
    `);

    // =========================
    // payments
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        method text NOT NULL, -- 'pix'|'card'|'manual'
        amount_cents integer NOT NULL,
        provider text,
        provider_id text,
        provider_meta jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // =========================
    // audit_logs
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        actor text NOT NULL,
        action text NOT NULL,
        details jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // =========================
    // customer_contacts (PT-BR, alinhado à entity)
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS customer_contacts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

        nome varchar(120) NOT NULL,
        cargo varchar(120),
        email varchar(180),
        telefone varchar(20),
        whatsapp varchar(20),
        canal_preferido varchar(20),

        responsavel_financeiro boolean DEFAULT false,
        responsavel_tecnico boolean DEFAULT false,

        aceite_comercial_ip varchar(60),
        aceite_comercial_data timestamptz,

        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_customer_contacts_customerId ON customer_contacts ("customerId")`);

    // =========================
    // customer_addresses (normalizado, alinhado à entity)
    // =========================
    await q.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

        tipo address_type_enum NOT NULL,
        logradouro varchar(180) NOT NULL,
        numero varchar(20) NOT NULL,
        complemento varchar(120),
        bairro varchar(120) NOT NULL,
        cidade varchar(120) NOT NULL,
        uf varchar(2) NOT NULL,
        cep varchar(9) NOT NULL,
        pais varchar(60) NOT NULL DEFAULT 'Brasil',

        codigo_ibge_municipio integer,

        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_customer_addresses_customerId ON customer_addresses ("customerId")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    // Drop em ordem reversa
    await q.query(`DROP INDEX IF EXISTS idx_customer_addresses_customerId`);
    await q.query(`DROP TABLE IF EXISTS customer_addresses`);

    await q.query(`DROP INDEX IF EXISTS idx_customer_contacts_customerId`);
    await q.query(`DROP TABLE IF EXISTS customer_contacts`);

    await q.query(`DROP TABLE IF EXISTS audit_logs`);
    await q.query(`DROP TABLE IF EXISTS payments`);
    await q.query(`DROP TABLE IF EXISTS invoice_items`);
    await q.query(`DROP TABLE IF EXISTS invoices`);
    await q.query(`DROP TABLE IF EXISTS subscriptions`);
    await q.query(`DROP TABLE IF EXISTS packages`);

    await q.query(`DROP INDEX IF EXISTS idx_customer_status`);
    await q.query(`DROP INDEX IF EXISTS idx_customer_cpf`);
    await q.query(`DROP INDEX IF EXISTS idx_customer_cnpj`);
    await q.query(`DROP TABLE IF EXISTS customers`);

    // Tipos
    await q.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname='address_type_enum') THEN DROP TYPE address_type_enum; END IF; END$$;`);
    await q.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname='person_type_enum')  THEN DROP TYPE person_type_enum;  END IF; END$$;`);
  }
}