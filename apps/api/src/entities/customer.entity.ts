import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column() legal_name!: string;
  @Column({ nullable: true }) trade_name?: string;
  @Column({ nullable: true }) tax_id?: string;
  @Column({ nullable: true }) email?: string;
  @Column({ nullable: true }) phone?: string;
  @Column({ nullable: true }) whatsapp?: string;
  @Column({ type: 'jsonb', nullable: true }) address?: any;
  @Column({ type: 'text', array: true, default: '{}' }) tags!: string[];
  @Column({ default: 'active' }) status!: 'active'|'inactive';

  @Column({ type: 'timestamptz', nullable: true }) pii_expire_at?: Date;

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
