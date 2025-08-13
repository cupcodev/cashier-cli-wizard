import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Customer } from './customer.entity';

@Entity({ name: 'customer_contacts' })
@Index('idx_contact_customer', ['customer'])
export class CustomerContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, c => c.contatos, { onDelete: 'CASCADE' })
  customer: Customer;

  @Column({ type: 'varchar', length: 120 })
  nome: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cargo: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;  // com DDI/DDDs (digits only na base)

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsapp: string | null;  // com consentimento

  @Column({ type: 'varchar', length: 20, nullable: true })
  canal_preferido: string | null; // email/sms/whatsapp

  @Column({ type: 'boolean', default: false })
  responsavel_financeiro: boolean;

  @Column({ type: 'boolean', default: false })
  responsavel_tecnico: boolean;

  @Column({ type: 'varchar', length: 60, nullable: true })
  aceite_comercial_ip: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  aceite_comercial_data: Date | null;
}