import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomerLegacyMerge20250811190000 implements MigrationInterface {
  name = 'CustomerLegacyMerge20250811190000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Enum tipo_pessoa
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'person_type_enum') THEN
          CREATE TYPE person_type_enum AS ENUM ('PJ', 'PF');
        END IF;
      END$$;
    `);

    // 2) Novas colunas (ADD COLUMN IF NOT EXISTS para idempotência)
    await queryRunner.query(`ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS tipo_pessoa person_type_enum,
      ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14),
      ADD COLUMN IF NOT EXISTS cpf VARCHAR(11),
      ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(30),
      ADD COLUMN IF NOT EXISTS inscricao_municipal VARCHAR(60),
      ADD COLUMN IF NOT EXISTS cnae_principal_cliente VARCHAR(20),
      ADD COLUMN IF NOT EXISTS porte_empresa VARCHAR(20),
      ADD COLUMN IF NOT EXISTS setor_atividade VARCHAR(60),
      ADD COLUMN IF NOT EXISTS classificacao_risco VARCHAR(30),
      ADD COLUMN IF NOT EXISTS cobranca_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS pagamento_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS contratos_info JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS fiscal_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS nfse_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS dunning_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS finance_kpis JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS contabilidade JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS portal_config JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS documentos_refs JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS lgpd JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS integracoes JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS criado_por VARCHAR(120),
      ADD COLUMN IF NOT EXISTS atualizado_por VARCHAR(120)
    ;`);

    // 3) Normaliza default de status (compatibilidade com ClientStatus)
    await queryRunner.query(`
      ALTER TABLE customers
      ALTER COLUMN status SET DEFAULT 'Ativo';
    `);

    // 4) Migra valores antigos de status ('active'/'inactive' -> 'Ativo'/'Encerrado')
    await queryRunner.query(`
      UPDATE customers
         SET status = 'Ativo'
       WHERE status ILIKE 'active';
    `);
    await queryRunner.query(`
      UPDATE customers
         SET status = 'Encerrado'
       WHERE status ILIKE 'inactive';
    `);

    // 5) Saneia tax_id legado em cnpj/cpf (não sobrescreve se já houver valor)
    await queryRunner.query(`
      WITH norm AS (
        SELECT id,
               regexp_replace(coalesce(tax_id, ''), '\\D', '', 'g') AS doc
          FROM customers
      )
      UPDATE customers c
         SET cnpj = CASE WHEN length(norm.doc) = 14 AND c.cnpj IS NULL AND c.cpf IS NULL THEN norm.doc ELSE c.cnpj END,
             cpf  = CASE WHEN length(norm.doc) = 11 AND c.cnpj IS NULL AND c.cpf IS NULL THEN norm.doc ELSE c.cpf  END
        FROM norm
       WHERE norm.id = c.id;
    `);

    // 6) Remove duplicatas de CNPJ/CPF (mantém o 1º por data de criação, zera os demais)
    await queryRunner.query(`
      WITH d AS (
        SELECT id, cnpj,
               ROW_NUMBER() OVER (PARTITION BY cnpj ORDER BY created_at NULLS FIRST, id) AS rn
          FROM customers
         WHERE cnpj IS NOT NULL
      )
      UPDATE customers c
         SET cnpj = NULL
        FROM d
       WHERE c.id = d.id
         AND d.rn > 1;
    `);
    await queryRunner.query(`
      WITH d AS (
        SELECT id, cpf,
               ROW_NUMBER() OVER (PARTITION BY cpf ORDER BY created_at NULLS FIRST, id) AS rn
          FROM customers
         WHERE cpf IS NOT NULL
      )
      UPDATE customers c
         SET cpf = NULL
        FROM d
       WHERE c.id = d.id
         AND d.rn > 1;
    `);

    // 7) Índices (parciais únicos para cnpj/cpf e não-único para status)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_cnpj
        ON customers (cnpj)
       WHERE cnpj IS NOT NULL;
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_cpf
        ON customers (cpf)
       WHERE cpf IS NOT NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_status
        ON customers (status);
    `);

    // 8) CHECK constraint (NOT VALID para não bloquear dados antigos; valide depois)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
            FROM pg_constraint
           WHERE conname = 'customers_tipo_doc_check'
        ) THEN
          ALTER TABLE customers
            ADD CONSTRAINT customers_tipo_doc_check
            CHECK (
              (tipo_pessoa = 'PJ' AND cnpj IS NOT NULL AND cpf IS NULL)
              OR
              (tipo_pessoa = 'PF' AND cpf IS NOT NULL AND cnpj IS NULL)
              OR
              (tipo_pessoa IS NULL) -- permite legado até validação
            ) NOT VALID;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverte CHECK
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'customers_tipo_doc_check'
        ) THEN
          ALTER TABLE customers DROP CONSTRAINT customers_tipo_doc_check;
        END IF;
      END$$;
    `);

    // Remove índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_cpf;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_cnpj;`);

    // Remove colunas adicionadas
    await queryRunner.query(`ALTER TABLE customers
      DROP COLUMN IF EXISTS atualizado_por,
      DROP COLUMN IF EXISTS criado_por,
      DROP COLUMN IF EXISTS integracoes,
      DROP COLUMN IF EXISTS lgpd,
      DROP COLUMN IF EXISTS documentos_refs,
      DROP COLUMN IF EXISTS portal_config,
      DROP COLUMN IF EXISTS contabilidade,
      DROP COLUMN IF EXISTS finance_kpis,
      DROP COLUMN IF EXISTS dunning_rules,
      DROP COLUMN IF EXISTS nfse_settings,
      DROP COLUMN IF EXISTS fiscal_rules,
      DROP COLUMN IF EXISTS contratos_info,
      DROP COLUMN IF EXISTS pagamento_prefs,
      DROP COLUMN IF EXISTS cobranca_prefs,
      DROP COLUMN IF EXISTS classificacao_risco,
      DROP COLUMN IF EXISTS setor_atividade,
      DROP COLUMN IF EXISTS porte_empresa,
      DROP COLUMN IF EXISTS cnae_principal_cliente,
      DROP COLUMN IF EXISTS inscricao_municipal,
      DROP COLUMN IF EXISTS inscricao_estadual,
      DROP COLUMN IF EXISTS cpf,
      DROP COLUMN IF EXISTS cnpj,
      DROP COLUMN IF EXISTS tipo_pessoa
    ;`);

    // Volta default de status
    await queryRunner.query(`
      ALTER TABLE customers
      ALTER COLUMN status SET DEFAULT 'active';
    `);

    // Remove enum se vazio (opcional: deixa se outro objeto usa)
    await queryRunner.query(`
      DO $$
      DECLARE
        uses INTEGER;
      BEGIN
        SELECT COUNT(*) INTO uses
          FROM pg_type t
          JOIN pg_depend d ON d.refobjid = t.oid
         WHERE t.typname = 'person_type_enum';
        IF uses = 0 THEN
          DROP TYPE IF EXISTS person_type_enum;
        END IF;
      END$$;
    `);
  }
}