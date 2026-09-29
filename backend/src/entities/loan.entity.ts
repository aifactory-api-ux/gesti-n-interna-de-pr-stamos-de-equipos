import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Equipment } from './equipment.entity';
import { Collaborator } from './collaborator.entity';
import { AuditLog } from './audit-log.entity';

@Entity('loan')
export class Loan {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'equipment_id', type: 'varchar', length: 255 })
  equipment_id: string;

  @Column({ name: 'collaborator_id', type: 'varchar', length: 255 })
  collaborator_id: string;

  @Column({ name: 'loan_date', type: 'timestamptz' })
  loan_date: Date;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  due_date: Date | null;

  @Column({ name: 'return_date', type: 'timestamptz', nullable: true })
  return_date: Date | null;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'approval_status', type: 'varchar', length: 50 })
  approval_status: string;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approved_at: Date | null;

  @Column({ name: 'approved_by', type: 'varchar', length: 255, nullable: true })
  approved_by: string | null;

  @ManyToOne(() => Equipment, (equipment) => equipment.loans)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.loans)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborator;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.loan)
  audit_logs: AuditLog[];
}
