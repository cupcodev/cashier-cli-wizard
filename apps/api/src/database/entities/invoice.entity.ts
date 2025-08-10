// apps/api/src/entities/invoice.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(()=>Customer, { eager: true }) @JoinColumn({ name: 'customer_id' }) customer!: Customer;
  @Column() customer_id!: string;

  @Column({ type: 'date' }) due_date!: string;
  @Column({ type: 'integer' }) amount_cents!: number;

  @Column({ default: 'open' }) status!: 'open'|'paid'|'overdue'|'cancelled';

  // juros/multa/desc final aplicados nesta fatura
  @Column({ type: 'jsonb', nullable: true }) terms?: {
    use_percentage_interest: boolean;
    interest_value_or_pct_bp: number;
    use_percentage_late_fee: boolean;
    late_fee_value_or_pct_bp: number;
    early_discount_enabled: boolean;
    early_discount_until?: string;
    early_discount_value_cents?: number;
  };

  @Column({ nullable: true }) settlement_reason?: string;
  @Column({ type: 'uuid', nullable: true }) settlement_attachment_file_id?: string;

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;

  @OneToMany(()=>InvoiceItem, i => i.invoice, { eager: true }) items!: InvoiceItem[];
}

@Entity({ name: 'invoice_items' })
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(()=>Invoice, i => i.items, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'invoice_id' }) invoice!: Invoice;
  @Column() invoice_id!: string;

  @Column() description!: string;
  @Column({ type: 'integer' }) amount_cents!: number;
}
