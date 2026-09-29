import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Loan } from './loan.entity';

@Entity('equipment')
export class Equipment {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'serial_number', type: 'varchar', length: 255, nullable: true })
  serial_number: string | null;

  @OneToMany(() => Loan, (loan) => loan.equipment)
  loans: Loan[];
}
