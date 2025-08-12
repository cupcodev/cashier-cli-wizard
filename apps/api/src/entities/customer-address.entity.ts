import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Customer } from './customer.entity';

export enum AddressType { COBRANCA='cobranca', OPERACIONAL='operacional' }

@Entity({ name: 'customer_addresses' })
@Index('idx_address_customer', ['customer'])
export class CustomerAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, c => c.enderecos, { onDelete: 'CASCADE' })
  customer: Customer;

  @Column({ type: 'enum', enum: AddressType })
  tipo: AddressType;

  @Column({ type: 'varchar', length: 180 }) logradouro: string;
  @Column({ type: 'varchar', length: 20 }) numero: string;
  @Column({ type: 'varchar', length: 120, nullable: true }) complemento: string | null;
  @Column({ type: 'varchar', length: 120 }) bairro: string;
  @Column({ type: 'varchar', length: 120 }) cidade: string;

  @Column({ type: 'varchar', length: 2 }) uf: string;
  @Column({ type: 'varchar', length: 9 }) cep: string;
  @Column({ type: 'varchar', length: 60, default: 'Brasil' }) pais: string;

  @Column({ type: 'integer', nullable: true })
  codigo_ibge_municipio: number | null;
}
