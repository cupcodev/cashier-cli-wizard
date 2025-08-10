import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(()=>Invoice, { eager: true }) @JoinColumn({ name: 'invoice_id' }) invoice!: Invoice;
  @Column() invoice_id!: string;

  @Column() method!: 'pix'|'card'|'manual';
  @Column({ type: 'integer' }) amount_cents!: number;

  @Column({ nullable: true }) provider!: string;
  @Column({ nullable: true }) provider_id!: string;
  @Column({ type: 'jsonb', nullable: true }) provider_meta?: any;

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
