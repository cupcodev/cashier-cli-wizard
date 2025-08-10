// apps/api/src/entities/subscription.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { PackageEntity } from './package.entity';

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @ManyToOne(()=>Customer, { eager: true }) @JoinColumn({ name: 'customer_id' }) customer!: Customer;
  @Column() customer_id!: string;

  @ManyToOne(()=>PackageEntity, { eager: true }) @JoinColumn({ name: 'package_id' }) package!: PackageEntity;
  @Column() package_id!: string;

  @Column({ default: 5 }) charge_day!: number; // dia do vencimento
  @Column({ type: 'date', nullable: true }) next_due_date?: string;

  // juros/multa/desconto
  @Column({ type: 'boolean', default: true }) use_percentage_interest!: boolean;
  @Column({ type: 'integer', default: 200 }) interest_value_or_pct_bp!: number; // basis points (200 = 2.00%) ou cents
  @Column({ type: 'boolean', default: true }) use_percentage_late_fee!: boolean;
  @Column({ type: 'integer', default: 200 }) late_fee_value_or_pct_bp!: number;
  @Column({ type: 'boolean', default: false }) early_discount_enabled!: boolean;
  @Column({ type: 'date', nullable: true }) early_discount_until?: string;
  @Column({ type: 'integer', nullable: true }) early_discount_value_cents?: number;

  @Column({ default: 'active' }) status!: 'active'|'paused'|'cancelled';

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
