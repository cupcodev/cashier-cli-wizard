import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerContacts1700000001000 implements MigrationInterface {
  name = 'AddCustomerContacts1700000001000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE customer_contacts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        name text NOT NULL,
        email text,
        phone text,
        whatsapp text,
        role text,
        is_billing_responsible boolean DEFAULT false,
        is_technical_responsible boolean DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await q.query(`CREATE INDEX idx_customer_contacts_customerId ON customer_contacts ("customerId")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS customer_contacts`);
  }
}