import { MigrationInterface, QueryRunner } from "typeorm";
export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000'
  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await q.query(`CREATE TABLE customers (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      legal_name text NOT NULL,
      trade_name text,
      tax_id text,
      email text,
      phone text,
      whatsapp text,
      address jsonb,
      tags text[] DEFAULT '{}',
      status text NOT NULL DEFAULT 'active',
      pii_expire_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE TABLE packages (
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
    )`);
    await q.query(`CREATE TABLE subscriptions (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      package_id uuid NOT NULL REFERENCES packages(id),
      charge_day integer NOT NULL DEFAULT 5,
      next_due_date date,
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
    )`);
    await q.query(`CREATE TABLE invoices (
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
    )`);
    await q.query(`CREATE TABLE invoice_items (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      description text NOT NULL,
      amount_cents integer NOT NULL
    )`);
    await q.query(`CREATE TABLE payments (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      method text NOT NULL,
      amount_cents integer NOT NULL,
      provider text,
      provider_id text,
      provider_meta jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE TABLE audit_logs (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      actor text NOT NULL,
      action text NOT NULL,
      details jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
  }
  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS audit_logs`);
    await q.query(`DROP TABLE IF EXISTS payments`);
    await q.query(`DROP TABLE IF EXISTS invoice_items`);
    await q.query(`DROP TABLE IF EXISTS invoices`);
    await q.query(`DROP TABLE IF EXISTS subscriptions`);
    await q.query(`DROP TABLE IF EXISTS packages`);
    await q.query(`DROP TABLE IF EXISTS customers`);
  }
}
