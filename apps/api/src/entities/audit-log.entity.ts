import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column() actor!: string;
  @Column() action!: string;
  @Column({ type: 'jsonb', nullable: true }) details?: any;

  @CreateDateColumn() created_at!: Date;
}
