import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'packages' })
export class PackageEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column() category!: string;
  @Column() tier!: string;
  @Column({ type: 'integer', default: 0 }) base_price_cents!: number;
  @Column({ type: 'integer', default: 0 }) promo_price_cents!: number;
  @Column({ default: 'monthly' }) periodicity!: 'monthly'|'annual'|'one_off';
  @Column({ type: 'jsonb', nullable: true }) config?: any;
  @Column({ default: true }) active!: boolean;

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
