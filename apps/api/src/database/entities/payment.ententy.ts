// apps/api/src/entities/payment.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(()=>Invoice, { eager: true }) @JoinColumn({ name: 'invoice_id' }) invoice!: Invoice;
  @Column() invoice_id!: string;

  @Column() method!: 'pix'|'card'|'manual';
  @Column({ type: 'integer' }) amount_cents!: number;

  @Column({ nullable: true }) provider!: string;     // ex: stripe/local
  @Column({ nullable: true }) provider_id!: string;  // id do charge
  @Column({ type: 'jsonb', nullable: true }) provider_meta?: any;

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
