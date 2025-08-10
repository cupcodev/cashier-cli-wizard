// apps/api/src/entities/package.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'packages' })
export class PackageEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column() category!: string; // ex: 'Branding', 'Tráfego Pago', 'Hospedagem', 'Redes Sociais', 'Site'
  @Column() tier!: string;     // PRO | MAX | ULTRA | CUSTOM
  @Column({ type: 'integer', default: 0 }) base_price_cents!: number;
  @Column({ type: 'integer', default: 0 }) promo_price_cents!: number; // preço "promocional" que é o usado
  @Column({ default: 'monthly' }) periodicity!: 'monthly'|'annual'|'one_off';
  @Column({ type: 'jsonb', nullable: true }) config?: any; // campos extras (percentual ads, etc.)
  @Column({ default: true }) active!: boolean;

  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
