import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Loan } from './loan.entity';

@Entity('collaborator')
export class Collaborator {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'azure_ad_id', type: 'varchar', length: 255, nullable: true })
  azure_ad_id: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @OneToMany(() => Loan, (loan) => loan.collaborator)
  loans: Loan[];
}
