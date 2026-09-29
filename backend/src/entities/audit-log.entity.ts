import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Loan } from './loan.entity';
import { Collaborator } from './collaborator.entity';

@Entity('audit_log')
export class AuditLog {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entity_type: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 255 })
  entity_id: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @ManyToOne(() => Loan, (loan) => loan.audit_logs)
  @JoinColumn({ name: 'entity_id' })
  loan: Loan;

  @ManyToOne(() => Collaborator)
  @JoinColumn({ name: 'user_id' })
  user: Collaborator;
}
