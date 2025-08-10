import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column() @Index()
  legal_name!: string;

  @Column({ nullable: true })
  cpf_cnpj!: string | null;

  @Column({ nullable: true })
  email!: string | null;

  @Column({ nullable: true })
  phone!: string | null;

  @Column({ default: 'active' })
  status!: 'active' | 'inactive';

  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at!: Date;
}
